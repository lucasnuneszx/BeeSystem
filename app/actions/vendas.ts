'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function listarProdutos() {
  try {
    return await prisma.produto.findMany({
      include: { lotes: true }
    });
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    return [];
  }
}

export async function criarPedido(dados: any) {
  try {
    const { cliente, total, itens, vendedorId } = dados;
    
    // Gerar código único e amigável (ex: PED-101...)
    const totalPedidos = await prisma.pedido.count();
    const codigo = `PED-${100 + totalPedidos + 1}`;
    
    // Iniciar transação para garantir integridade atômica
    const novoPedido = await prisma.pedido.create({
      data: {
        codigo,
        cliente,
        status: 'PENDENTE',
        vendedorId: vendedorId || '1', // Default se não houver login real
        itens: {
          create: itens.map((item: any) => ({
            produtoId: item.id,
            quantidade: item.quantidade,
            preco: item.preco
          }))
        }
      }
    });
    
    revalidatePath('/vendas/novo-pedido');
    revalidatePath('/gerencial/monitoramento');
    return { sucesso: true, id: novoPedido.id };
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    return { sucesso: false, erro: 'Falha na persistência logística: ' + (error instanceof Error ? error.message : 'Divergência de dados.') };
  }
}
