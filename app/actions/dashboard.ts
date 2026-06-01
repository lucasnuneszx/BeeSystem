'use server';
import prisma from '@/lib/prisma';

export async function obterMetricasDashboard() {
  const now = new Date();
  
  try {
    const totalPedidos = await prisma.order.count();
    const pendentes = await prisma.order.count({ where: { status: 'PENDING' } });
    const aprovados = await prisma.order.count({ where: { status: 'APPROVED' } });
    const rejeitados = await prisma.order.count({ where: { status: 'REJECTED' } });

    const lotesVencidos = await prisma.lot.count({
      where: {
        expirationDate: { lte: now },
        availableQuantity: { gt: 0 }
      }
    });

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const lotesProximos = await prisma.lot.count({
      where: {
        expirationDate: {
          gt: now,
          lte: thirtyDaysFromNow
        },
        availableQuantity: { gt: 0 }
      }
    });

    const sumEstoque = await prisma.lot.aggregate({
      where: {
        availableQuantity: { gt: 0 }
      },
      _sum: {
        availableQuantity: true
      }
    });
    const estoqueTotal = sumEstoque._sum.availableQuantity || 0;

    const lotesVencidosLista = await prisma.lot.findMany({
      where: { 
        expirationDate: { lte: now },
        availableQuantity: { gt: 0 }
      },
      include: { product: true },
      take: 5
    });

    const lotesProximosLista = await prisma.lot.findMany({
      where: { 
        expirationDate: { gt: now, lte: thirtyDaysFromNow },
        availableQuantity: { gt: 0 }
      },
      include: { product: true },
      take: 5
    });

    const alertasVencidos = lotesVencidosLista.map(l => ({
      id: l.id,
      produto: l.product.name,
      lote: l.code,
      quantidade: l.availableQuantity,
      validade: l.expirationDate
    }));

    const alertasProximos = lotesProximosLista.map(l => ({
      id: l.id,
      produto: l.product.name,
      lote: l.code,
      quantidade: l.availableQuantity,
      validade: l.expirationDate
    }));

    return {
      totalPedidos,
      pendentes,
      aprovados,
      rejeitados,
      lotesVencidos,
      lotesProximos,
      estoqueTotal,
      alertasVencidos,
      alertasProximos
    };
  } catch (error) {
    console.error("Erro ao obter metricas:", error);
    return {
      totalPedidos: 0,
      pendentes: 0,
      aprovados: 0,
      rejeitados: 0,
      lotesVencidos: 0,
      lotesProximos: 0,
      estoqueTotal: 0,
      alertasVencidos: [],
      alertasProximos: []
    };
  }
}
