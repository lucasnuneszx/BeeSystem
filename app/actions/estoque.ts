'use server';

import prisma from '@/lib/prisma';

export async function obterMapaEstoque() {
  try {
    const lots = await prisma.lot.findMany({
      include: {
        product: true
      },
      orderBy: {
        code: 'asc'
      }
    });

    return lots.map(l => {
      // Mapeia localização como "GALPÃO A - P01"
      const locationParts = l.location.split(' - ');
      const corredor = locationParts[0]?.replace('GALPÃO ', '') || 'A';
      const posicao = locationParts[1]?.replace('P', '') || '01';

      return {
        id: l.id,
        item: l.product.name,
        lote: l.code,
        localizacao: l.location,
        corredor: corredor,
        posicao: posicao,
        validade: l.expirationDate.toISOString().split('T')[0],
        qtd: l.availableQuantity,
        status: l.status
      };
    });
  } catch (error) {
    console.error('Erro ao obter mapa de estoque:', error);
    return [];
  }
}

export async function obterUnidadesRecebidasRecentes() {
  try {
    const units = await prisma.productUnit.findMany({
      include: {
        product: true,
        lot: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    return units.map(u => ({
      id: u.id,
      qrCodeValue: u.qrCodeValue,
      product: {
        name: u.product.name
      },
      lot: {
        code: u.lot.code
      },
      status: u.status,
      createdAt: u.createdAt.toISOString()
    }));
  } catch (error) {
    console.error('Erro ao obter unidades recebidas:', error);
    return [];
  }
}
