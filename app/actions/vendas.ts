'use server';
import prisma from '@/lib/prisma';
import { obterSessaoAtual } from './usuarios';

export async function criarPedido(dados: any) {
  try {
    const session = await obterSessaoAtual();
    if (!session) return { sucesso: false, erro: 'Não autenticado' };

    const customer = await prisma.customer.findFirst();
    
    const order = await prisma.order.create({
      data: {
        code: `PED-${Date.now()}`,
        customerId: customer?.id || '',
        sellerId: session.id,
        status: 'PENDING',
        totalAmount: 0
      }
    });

    return { sucesso: true, orderId: order.id };
  } catch (e) {
    return { sucesso: false };
  }
}

export async function obterDadosNovoPedido() {
  const produtos = await prisma.product.findMany({ include: { lots: true }});
  const clientes = await prisma.customer.findMany();
  return { produtos, clientes };
}
