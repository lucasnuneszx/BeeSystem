'use server';

import prisma from '@/lib/prisma';

export async function obterMetricasDashboard() {
  try {
    const totalPedidos = await prisma.pedido.count();
    const pendentes = await prisma.pedido.count({ where: { status: 'PENDENTE' } });
    const produtos = await prisma.produto.count();
    const estoqueBaixo = await prisma.produto.count({
      where: {
        itensPedido: {
          some: {} // Exemplo simplificado
        }
      }
    });

    // Auditoria de lotes próximos ao vencimento
    const hoje = new Date();
    const proximoMes = new Date();
    proximoMes.setMonth(hoje.getMonth() + 1);

    const alertasValidade = await prisma.loteEstoque.count({
      where: {
        validade: {
          lte: proximoMes,
          gte: hoje
        }
      }
    });

    return {
      totalPedidos,
      pendentes,
      produtosAtivos: produtos,
      alertasValidade,
      vendasRecentes: await prisma.pedido.findMany({
          take: 5,
          orderBy: { criadoEm: 'desc' },
          include: { vendedor: true }
      })
    };
  } catch (error) {
    console.error('Erro ao ler métricas:', error);
    return null;
  }
}
