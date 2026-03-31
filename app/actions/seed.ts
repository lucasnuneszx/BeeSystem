'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function popularBancoDeDados() {
  try {
    // 1. Criar Usuário Admin se não existir
    const admin = await prisma.usuario.upsert({
      where: { email: 'admin@beesystem.com' },
      update: {},
      create: {
        nome: 'Administrador Colmeia',
        email: 'admin@beesystem.com',
        cpf: '000.000.000-01',
        perfil: 'ADMIN',
        status: 'ATIVO'
      }
    });

    // 2. Criar Vendedores
    await prisma.usuario.upsert({
      where: { email: 'vendas@beesystem.com' },
      update: {},
      create: {
        nome: 'Equipe de Vendas 01',
        email: 'vendas@beesystem.com',
        cpf: '111.111.111-11',
        perfil: 'VENDEDOR',
        status: 'ATIVO'
      }
    });

    // 3. Criar Fornecedor
    const fornecedor = await prisma.fornecedor.upsert({
      where: { cnpj: '12.345.678/0001-90' },
      update: {},
      create: {
        nome: 'Apicultura Central Brasil',
        cnpj: '12.345.678/0001-90',
        email: 'contato@apiculturacentral.com'
      }
    });

    // 4. Criar Produtos Iniciais
    const p1 = await prisma.produto.upsert({
      where: { sku: 'MEL-SILV-500G' },
      update: {},
      create: {
        nome: 'Mel Silvestre Puro 500g',
        sku: 'MEL-SILV-500G',
        categoria: 'MEL',
        estoqueMin: 20
      }
    });

    const p2 = await prisma.produto.upsert({
      where: { sku: 'PRO-VERD-30ML' },
      update: {},
      create: {
        nome: 'Própolis Verde 30ml',
        sku: 'PRO-VERD-30ML',
        categoria: 'SAÚDE',
        estoqueMin: 15
      }
    });

    // 5. Criar Lotes Iniciais
    await prisma.loteEstoque.create({
      data: {
        numeroLote: 'LOT-2024-001',
        quantidade: 1000,
        validade: new Date('2025-12-30'),
        localizacao: 'GALPÃO A - P01',
        produtoId: p1.id,
        fornecedorId: fornecedor.id
      }
    });

    // 6. Criar Pedidos Iniciais (RF14)
    await prisma.pedido.create({
      data: {
        codigo: 'PED-INIT-001',
        cliente: 'Supermercado Elite',
        status: 'PENDENTE',
        vendedorId: admin.id,
        itens: {
          create: [
            { produtoId: p1.id, quantidade: 50, preco: 18.50 },
            { produtoId: p2.id, quantidade: 20, preco: 35.00 }
          ]
        }
      }
    });

    revalidatePath('/');
    revalidatePath('/dashboard');
    revalidatePath('/vendas/novo-pedido');

    return { sucesso: true, mensagem: 'Banco de dados populado com integridade operacional!' };
  } catch (error) {
    console.error('Erro ao popular banco:', error);
    return {
      sucesso: false,
      erro: 'Falha na Persistência de Elite: ' + (error instanceof Error ? error.message : 'Divergência técnica no motor Prisma.')
    };
  }
}
