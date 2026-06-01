'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

async function obterUsuarioSessao() {
  const cookieStore = await cookies();
  const sessao = cookieStore.get('beesystem_sessao')?.value;
  if (!sessao) return null;
  try {
    return JSON.parse(atob(sessao)) as { id: string; role: string; nome: string };
  } catch {
    return null;
  }
}

export async function autenticarUsuario(email: string, senha: string) {
  try {
    const usuario = await prisma.user.findFirst({
      where: { email: email.toLowerCase().trim(), status: 'ACTIVE' },
      include: { role: true }
    });

    if (!usuario) return { sucesso: false, erro: 'Usuário não encontrado ou inativo.' };

    if (usuario.password) {
      const senhaValida = await bcrypt.compare(senha, usuario.password);
      if (!senhaValida) return { sucesso: false, erro: 'Senha incorreta.' };
    }

    const dadosSessao = {
      id: usuario.id,
      nome: usuario.name,
      email: usuario.email,
      role: usuario.role.name,
      cpf: usuario.cpf
    };

    const cookieStore = await cookies();
    cookieStore.set('beesystem_sessao', btoa(JSON.stringify(dadosSessao)), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 horas
      path: '/'
    });

    return { sucesso: true, usuario: dadosSessao };
  } catch (error) {
    return { sucesso: false, erro: 'Erro técnico no servidor.' };
  }
}

export async function encerrarSessao() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('beesystem_sessao');
    return { sucesso: true };
  } catch {
    return { sucesso: false };
  }
}
