'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function listarPedidos() {
  try {
    return await prisma.pedido.findMany({
      include: { vendedor: true },
      orderBy: { criadoEm: 'desc' }
    });
  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    return [];
  }
}

export async function aprovarPedido(id: string) {
  try {
    await prisma.pedido.update({
      where: { id },
      data: { status: 'APROVADO' }
    });
    revalidatePath('/gerencial/monitoramento');
    return { sucesso: true };
  } catch (error) {
    console.error('Erro ao aprovar pedido:', error);
    return { sucesso: false };
  }
}

export async function rejeitarPedido(id: string, justificativa: string) {
  try {
    await prisma.pedido.update({
      where: { id },
      data: { status: 'REJEITADO', justificativa }
    });
    revalidatePath('/gerencial/monitoramento');
    return { sucesso: true };
  } catch (error) {
    console.error('Erro ao rejeitar pedido:', error);
    return { sucesso: false };
  }
}
