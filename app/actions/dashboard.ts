'use server';

import prisma from '@/lib/prisma';

export async function obterMetricasDashboard() {
  try {
    const totalPedidos = await prisma.order.count();
    const pendentes = await prisma.order.count({ where: { status: 'PENDING' } });
    const aprovados = await prisma.order.count({ where: { status: 'APPROVED' } });
    const rejeitados = await prisma.order.count({ where: { status: 'REJECTED' } });

    const lotesVencidosCount = await prisma.lot.count({ where: { status: 'EXPIRED' } });
    const estoqueTotal = await prisma.lot.aggregate({
      _sum: { availableQuantity: true }
    });

    const hoje = new Date();
    const trintaDias = new Date();
    trintaDias.setDate(hoje.getDate() + 30);

    const lotesProximosCount = await prisma.lot.count({
      where: {
        expirationDate: { lte: trintaDias, gt: hoje },
        status: 'ACTIVE'
      }
    });

    const alertasVencidos = await prisma.lot.findMany({
      where: { status: 'EXPIRED' },
      include: { product: true }
    });

    const alertasProximos = await prisma.lot.findMany({
      where: {
        expirationDate: { lte: trintaDias, gt: hoje },
        status: 'ACTIVE'
      },
      include: { product: true }
    });

    const mapAlerta = (l: any) => ({
      id: l.id,
      produto: l.product.name,
      lote: l.code,
      validade: l.expirationDate.toISOString(),
      quantidade: l.availableQuantity
    });

    return {
      totalPedidos,
      pendentes,
      aprovados,
      rejeitados,
      lotesVencidos: lotesVencidosCount,
      estoqueTotal: estoqueTotal._sum.availableQuantity || 0,
      lotesProximos: lotesProximosCount,
      alertasVencidos: alertasVencidos.map(mapAlerta),
      alertasProximos: alertasProximos.map(mapAlerta)
    };
  } catch (error) {
    console.error('Erro ao obter metricas:', error);
    return null;
  }
}
