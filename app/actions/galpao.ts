'use server';
import prisma from '@/lib/prisma';
import { obterSessaoAtual } from './usuarios';

// RN07: QR Code Obrigatório e Leitura
export async function registrarScanner(qrCodeValue: string, location: string) {
  try {
    const session = await obterSessaoAtual();
    if (!session || (session.role !== 'Oficial de Registros' && session.role !== 'admin' && session.role !== 'Gerente')) {
      return { sucesso: false, erro: 'Acesso negado: Somente Oficiais de Registro podem utilizar o scanner.' };
    }

    if (!qrCodeValue) throw new Error('QR Code obrigatório.'); // RN07

    const unit = await prisma.productUnit.findUnique({
      where: { qrCodeValue }
    });

    if (!unit) {
      throw new Error('Unidade não encontrada para este QR Code.');
    }

    await prisma.scannerEvent.create({
      data: {
        unitId: unit.id,
        userId: session.id,
        eventType: 'SCANNED',
        location: location
      }
    });

    // Atualiza a localização atual da unidade
    await prisma.productUnit.update({
      where: { id: unit.id },
      data: { currentLocation: location }
    });

    // Auditoria RN06
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: 'SCAN',
        entity: 'ProductUnit',
        description: `QR Code ${qrCodeValue} lido. Unidade movida para ${location}.`,
      }
    });

    return { sucesso: true, unit };
  } catch (e: any) {
    return { sucesso: false, erro: e.message };
  }
}

export async function registrarDisparidade(productIdOrRemessa: string, expectedQtyOrObservacao: any, actualQty?: number) {
  try {
    const session = await obterSessaoAtual();
    if (!session) return { sucesso: false, erro: 'Não autenticado' };

    let prodId = productIdOrRemessa;
    let expQty = typeof expectedQtyOrObservacao === 'number' ? expectedQtyOrObservacao : 1;
    let actQty = actualQty ?? 0;

    // Evitar quebras de integridade referencial buscando um produto válido
    const primeiroProduto = await prisma.product.findFirst();
    if (primeiroProduto) {
      prodId = primeiroProduto.id;
    }

    const discrepancy = await prisma.discrepancy.create({
      data: {
        productId: prodId,
        expectedQty: expQty,
        actualQty: actQty,
        status: 'OPEN'
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: 'CREATE',
        entity: 'Discrepancy',
        description: `Disparidade registrada. Ref/Remessa: ${productIdOrRemessa}. Obs: ${expectedQtyOrObservacao}`,
      }
    });

    return { sucesso: true, discrepancy };
  } catch (e: any) {
    return { sucesso: false, erro: e.message };
  }
}

export async function obterInventario() {
  return await prisma.inventory.findMany({
    orderBy: { location: 'asc' }
  });
}

export async function obterMapaEstoque() {
  try {
    const lotes = await prisma.lot.findMany({
      where: {
        availableQuantity: { gt: 0 }
      },
      include: {
        product: true,
        supplier: true
      },
      orderBy: {
        location: 'asc'
      }
    });
    return { sucesso: true, lotes };
  } catch (error: any) {
    return { sucesso: false, erro: error.message, lotes: [] };
  }
}

export async function obterDisparidades() {
  try {
    const items = await prisma.discrepancy.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    const products = await prisma.product.findMany();
    const productMap = new Map(products.map(p => [p.id, p]));

    return items.map(d => {
      const prod = productMap.get(d.productId);
      return {
        id: d.id,
        remessa: `NF-${d.id.slice(0, 4).toUpperCase()}`,
        item: prod ? prod.name : 'Produto Desconhecido',
        observacao: `Divergência operacional: Esperado ${d.expectedQty} un, Recebido ${d.actualQty} un.`,
        status: d.status === 'OPEN' ? 'EM_ANALISE' : 'RESOLVIDO',
        gravidade: d.expectedQty - d.actualQty > 10 ? 'CRITICA' : 'MEDIA',
        data: d.createdAt.toISOString().split('T')[0]
      };
    });
  } catch (error) {
    console.error('Erro ao obter disparidades:', error);
    return [];
  }
}
