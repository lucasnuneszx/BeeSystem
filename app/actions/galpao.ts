'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function registrarRecebimento(dados: any) {
  try {
    const { numeroLote, quantidade, validade, produtoId, fornecedorId, localizacao } = dados;
    
    await prisma.loteEstoque.create({
      data: {
        numeroLote,
        quantidade: parseInt(quantidade),
        validade: new Date(validade),
        produtoId,
        fornecedorId,
        localizacao
      }
    });
    
    revalidatePath('/galpao/recebimento');
    revalidatePath('/dashboard');
    return { sucesso: true };
  } catch (error) {
    console.error('Erro ao registrar recebimento:', error);
    return { sucesso: false };
  }
}

export async function registrarDisparidade(dados: any) {
  try {
    const { usuarioId, acao, detalhes } = dados;
    
    await prisma.logAuditoria.create({
      data: {
        usuarioId: usuarioId || '1',
        acao: 'DISPARIDADE: ' + acao,
        modulo: 'GALPÃO',
        detalhes
      }
    });
    
    revalidatePath('/galpao/disparidade');
    return { sucesso: true };
  } catch (error) {
    console.error('Erro ao registrar disparidade:', error);
    return { sucesso: false };
  }
}
