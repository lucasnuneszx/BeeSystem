'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function listarUsuarios() {
  try {
    return await prisma.usuario.findMany({
      orderBy: { criadoEm: 'desc' }
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return [];
  }
}

export async function salvarUsuario(dados: any) {
  try {
    const { id, nome, email, cpf, perfil, status } = dados;
    
    if (id) {
      // Atualizar
      await prisma.usuario.update({
        where: { id },
        data: { nome, email, cpf, perfil, status }
      });
    } else {
      // Criar novo amigável
      await prisma.usuario.create({
        data: { nome, email, cpf, perfil, status: 'ATIVO' }
      });
    }
    
    revalidatePath('/admin/usuarios');
    return { sucesso: true };
  } catch (error) {
    console.error('Erro ao salvar usuário:', error);
    return { sucesso: false, erro: 'Falha na persistência de dados. Verifique os campos.' };
  }
}

export async function alternarStatusUsuario(id: string, statusAtual: string) {
  try {
    const novoStatus = statusAtual === 'ATIVO' ? 'INATIVO' : 'ATIVO';
    await prisma.usuario.update({
      where: { id },
      data: { status: novoStatus }
    });
    revalidatePath('/admin/usuarios');
    return { sucesso: true };
  } catch (error) {
    console.error('Erro ao alternar status:', error);
    return { sucesso: false };
  }
}

export async function excluirUsuario(id: string) {
  try {
    await prisma.usuario.delete({
      where: { id }
    });
    revalidatePath('/admin/usuarios');
    return { sucesso: true };
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    return { sucesso: false };
  }
}
