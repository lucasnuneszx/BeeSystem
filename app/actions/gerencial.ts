'use server';
import prisma from '@/lib/prisma';
import { obterSessaoAtual } from './usuarios';

// RN04: Somente gerente aprova
export async function aprovarPedido(orderId: string) {
  try {
    const session = await obterSessaoAtual();
    if (!session || (session.role !== 'admin' && session.role !== 'Gerente')) {
      return { sucesso: false, erro: 'Acesso negado: Somente gerentes podem aprovar pedidos.' };
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('Pedido não encontrado');

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'APPROVED' }
    });

    // Auditoria RN06
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: 'APPROVE',
        entity: 'Order',
        description: `Pedido ${order.code} aprovado pelo gerente.`,
      }
    });

    return { sucesso: true, order: updatedOrder };
  } catch (e: any) {
    return { sucesso: false, erro: e.message };
  }
}

// RN05: Pedidos rejeitados devem ir para histórico
export async function rejeitarPedido(orderId: string, justification: string) {
  try {
    const session = await obterSessaoAtual();
    if (!session || (session.role !== 'admin' && session.role !== 'Gerente')) {
      return { sucesso: false, erro: 'Acesso negado: Somente gerentes podem rejeitar pedidos.' };
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('Pedido não encontrado');

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: 'REJECTED',
        justification: justification
      }
    });

    // Auditoria RN06
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: 'REJECT',
        entity: 'Order',
        description: `Pedido ${order.code} rejeitado. Justificativa: ${justification}`,
      }
    });

    return { sucesso: true, order: updatedOrder };
  } catch (e: any) {
    return { sucesso: false, erro: e.message };
  }
}

export async function listarPedidos() {
  try {
    const list = await prisma.order.findMany({
      include: { 
        customer: true, 
        seller: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return list.map(o => ({
      id: o.id,
      codigo: o.code,
      cliente: o.customer.name,
      status: o.status === 'PENDING' ? 'PENDENTE' : o.status === 'APPROVED' ? 'APROVADO' : 'REJEITADO',
      vendedor: { nome: o.seller.name },
      criadoEm: o.createdAt,
      itens: o.items.map(item => ({
        preco: item.unitPrice,
        quantidade: item.quantity
      }))
    }));
  } catch (error) {
    console.error("Erro ao listar pedidos:", error);
    return [];
  }
}

export async function obterLogsAuditoria() {
  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return logs.map(l => ({
      id: l.id,
      usuario: l.user.name,
      acao: l.action === 'APPROVE' ? 'Aprovação de Pedido' :
            l.action === 'CREATE' ? 'Criação de Pedido' :
            l.action === 'SCAN' ? 'Leitura de QR Code' :
            l.action === 'REJECT' ? 'Rejeição de Pedido' : l.action,
      modulo: l.entity === 'Order' ? 'Vendas' :
              l.entity === 'ProductUnit' ? 'Galpão' :
              l.entity === 'Discrepancy' ? 'Galpão' : 'Sistema',
      detalhe: l.description,
      data: l.createdAt.toISOString().replace('T', ' ').substring(0, 16)
    }));
  } catch (error) {
    console.error("Erro ao obter logs de auditoria:", error);
    return [];
  }
}
