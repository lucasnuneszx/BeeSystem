'use server';
import prisma from '@/lib/prisma';
import { obterSessaoAtual } from './usuarios';

export async function criarPedido(dados: { customerId: string, items: { productId: string, quantity: number }[] }) {
  try {
    const session = await obterSessaoAtual();
    if (!session) return { sucesso: false, erro: 'Não autenticado' };

    // RN01 & RN02: Validar produtos vencidos e aplicar FIFO
    let totalAmount = 0;
    const orderItems = [];

    for (const item of dados.items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new Error(`Produto não encontrado: ${item.productId}`);

      // Buscar lotes ativos e não vencidos, ordenados pela menor validade (FIFO - RN02)
      const validLots = await prisma.lot.findMany({
        where: {
          productId: item.productId,
          status: 'ACTIVE',
          expirationDate: { gt: new Date() }, // RN01: Bloquear produtos vencidos
          availableQuantity: { gt: 0 }
        },
        orderBy: { expirationDate: 'asc' } // FIFO
      });

      let remainingQuantity = item.quantity;
      let usedLots = [];

      for (const lot of validLots) {
        if (remainingQuantity <= 0) break;
        const take = Math.min(lot.availableQuantity, remainingQuantity);
        
        usedLots.push({ lotId: lot.id, quantity: take, price: product.price });
        totalAmount += take * product.price;
        remainingQuantity -= take;
      }

      if (remainingQuantity > 0) {
        throw new Error(`Estoque insuficiente ou vencido para o produto ${product.name}`);
      }

      for (const ul of usedLots) {
        orderItems.push({
          productId: item.productId,
          lotId: ul.lotId,
          quantity: ul.quantity,
          unitPrice: ul.price,
          fifoApplied: true
        });
      }
    }

    const order = await prisma.order.create({
      data: {
        code: `PED-${Date.now()}`,
        customerId: dados.customerId,
        sellerId: session.id,
        status: 'PENDING',
        totalAmount,
        items: {
          create: orderItems
        }
      }
    });

    // Auditoria (RN06)
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: 'CREATE',
        entity: 'Order',
        description: `Pedido ${order.code} criado.`,
      }
    });

    return { sucesso: true, orderId: order.id };
  } catch (e: any) {
    return { sucesso: false, erro: e.message };
  }
}

export async function editarPedido(orderId: string, dados: any) {
  try {
    const session = await obterSessaoAtual();
    if (!session) return { sucesso: false, erro: 'Não autenticado' };

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('Pedido não encontrado');

    // RN03: Vendedor NÃO pode editar pedidos aprovados
    if (order.status === 'APPROVED' || order.status === 'APROVADO') {
      throw new Error('Não é possível editar um pedido já aprovado.');
    }

    // Lógica de edição iria aqui (simplificada para auditoria)

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: 'UPDATE',
        entity: 'Order',
        description: `Pedido ${order.code} editado.`,
      }
    });

    return { sucesso: true };
  } catch (e: any) {
    return { sucesso: false, erro: e.message };
  }
}

export async function obterDadosNovoPedido() {
  const produtos = await prisma.product.findMany({
    include: {
      lots: {
        where: {
          status: 'ACTIVE',
          expirationDate: { gt: new Date() },
          availableQuantity: { gt: 0 }
        },
        orderBy: { expirationDate: 'asc' }
      }
    }
  });
  const clientes = await prisma.customer.findMany();
  return { produtos, clientes };
}

export async function listarPedidos() {
  return await prisma.order.findMany({
    include: { customer: true, items: true },
    orderBy: { createdAt: 'desc' }
  });
}
