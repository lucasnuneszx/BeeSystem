'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';

async function obterUsuarioSessao() {
  const cookieStore = await cookies();
  const sessao = cookieStore.get('beesystem_sessao')?.value;
  if (!sessao) return null;
  try {
    return JSON.parse(atob(sessao)) as { id: string; role: string; nome: string; email: string; cpf: string };
  } catch {
    return null;
  }
}

export async function autenticarUsuario(email: string, senha: string) {
  try {
    if (!email || !senha) {
      return { sucesso: false, erro: 'E-mail e senha são obrigatórios.' };
    }

    let authUserId: string | null = null;
    const authUserEmail = email.toLowerCase().trim();

    // 1. Tentar logar via Supabase Auth real
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authUserEmail,
        password: senha
      });

      if (error) {
        // Fallback local apenas em desenvolvimento se falhar
        if (process.env.NODE_ENV === 'development') {
          console.warn("Falha no Supabase Auth. Utilizando fallback local para desenvolvimento:", error.message);
        } else {
          return { sucesso: false, erro: `Falha na autenticação: ${error.message}` };
        }
      } else if (data && data.user) {
        authUserId = data.user.id;
      }
    } catch (e: any) {
      if (process.env.NODE_ENV !== 'development') {
        return { sucesso: false, erro: 'Erro de comunicação com o serviço de autenticação.' };
      }
    }

    // 2. Localizar perfil do usuário no banco público (User)
    let usuario: any = null;
    if (authUserId) {
      usuario = await prisma.user.findUnique({
        where: { id: authUserId },
        include: { role: true }
      });
    }

    // Fallback por e-mail se não achou por ID (ex: usuários criados via seeds locais ou antigo fluxo)
    if (!usuario) {
      usuario = await prisma.user.findFirst({
        where: { email: authUserEmail },
        include: { role: true }
      });

      // Se achou pelo e-mail e temos o ID real do Supabase, atualiza no banco de dados para vincular
      if (usuario && authUserId) {
        try {
          await prisma.$executeRawUnsafe(`UPDATE "User" SET "id" = '${authUserId}' WHERE "id" = '${usuario.id}'`);
          usuario = await prisma.user.findUnique({
            where: { id: authUserId },
            include: { role: true }
          });
        } catch (linkError) {
          console.error("Erro ao vincular ID do Supabase Auth ao perfil de usuário:", linkError);
        }
      }
    }

    if (!usuario) {
      return { sucesso: false, erro: 'Usuário não cadastrado no sistema.' };
    }

    // Validação bcrypt se o auth do Supabase não foi usado (fallback de dev)
    if (!authUserId) {
      if (usuario.password) {
        const senhaValida = await bcrypt.compare(senha, usuario.password);
        if (!senhaValida) return { sucesso: false, erro: 'Senha de fallback incorreta.' };
      } else {
        // Desenvolvimento local: permitir 'BeeSystem@2026' para usuários do seed sem senha
        if (process.env.NODE_ENV === 'development' && senha === 'BeeSystem@2026') {
          console.warn(`[DEV] Usuário ${usuario.email} autenticado via bypass local.`);
        } else {
          return { sucesso: false, erro: 'Autenticação indisponível sem senha configurada.' };
        }
      }
    }

    // 3. Validar se o usuário está ativo
    if (usuario.status !== 'ACTIVE' && usuario.status !== 'ATIVO') {
      return { sucesso: false, erro: 'Acesso negado: Usuário inativo.' };
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
    console.error("Erro no fluxo de autenticação:", error);
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

export const obterSessaoAtual = obterUsuarioSessao;

export async function listarUsuarios() {
  try {
    const list = await prisma.user.findMany({
      include: { role: true },
      orderBy: { name: 'asc' }
    });

    const mapRoleToPerfil = (roleName: string) => {
      const map: Record<string, string> = {
        'ADMIN': 'ADMIN',
        'MANAGER': 'GERENTE',
        'SELLER': 'VENDEDOR',
        'OFFICER': 'OFICIAL'
      };
      return map[roleName] || 'VENDEDOR';
    };

    return list.map(u => ({
      id: u.id,
      nome: u.name,
      email: u.email,
      cpf: u.cpf,
      perfil: mapRoleToPerfil(u.role.name),
      status: u.status === 'ACTIVE' ? 'ATIVO' : 'INATIVO'
    }));
  } catch (error) {
    console.error("Erro ao listar usuarios:", error);
    return [];
  }
}

export async function salvarUsuario(dados: { id?: string; nome: string; email: string; cpf: string; perfil: string; senha?: string }) {
  try {
    const emailNormalizado = dados.email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;
    if (!emailRegex.test(emailNormalizado)) {
      return { sucesso: false, erro: 'O e-mail deve ser um endereço válido terminando com .com (exemplo@dominio.com).' };
    }

    const mapPerfilToRole = (perfil: string) => {
      const map: Record<string, string> = {
        'ADMIN': 'ADMIN',
        'GERENTE': 'MANAGER',
        'VENDEDOR': 'SELLER',
        'OFICIAL': 'OFFICER'
      };
      return map[perfil] || 'SELLER';
    };

    const roleName = mapPerfilToRole(dados.perfil);
    const dbRole = await prisma.role.findUnique({
      where: { name: roleName }
    });

    if (!dbRole) {
      return { sucesso: false, erro: `Role ${roleName} não encontrada no banco.` };
    }

    if (dados.id) {
      // Atualizar perfil
      const updateData: any = {
        name: dados.nome,
        email: emailNormalizado,
        cpf: dados.cpf,
        roleId: dbRole.id
      };
      if (dados.senha && dados.senha.trim() !== '') {
        updateData.password = await bcrypt.hash(dados.senha, 10);
      }
      await prisma.user.update({
        where: { id: dados.id },
        data: updateData
      });
      return { sucesso: true };
    } else {
      // Criar novo usuário no Supabase Auth e no Banco público
      if (!dados.senha || dados.senha.trim() === '') {
        return { sucesso: false, erro: 'A senha é obrigatória para a criação de um novo colaborador.' };
      }
      const senhaValida = dados.senha;
      let authUserId: string | null = null;

      try {
        const { data, error } = await supabase.auth.signUp({
          email: emailNormalizado,
          password: senhaValida
        });

        if (error) {
          if (process.env.NODE_ENV === 'development') {
            console.warn("Falha no Supabase Auth. Utilizando ID de desenvolvimento:", error.message);
            authUserId = 'dev-' + Math.random().toString(36).substring(2, 10);
          } else {
            return { sucesso: false, erro: `Erro no Supabase Auth: ${error.message}` };
          }
        } else if (data && data.user) {
          authUserId = data.user.id;
        }
      } catch (e: any) {
        if (process.env.NODE_ENV === 'development') {
          authUserId = 'dev-' + Math.random().toString(36).substring(2, 10);
        } else {
          return { sucesso: false, erro: 'Erro de comunicação ao registrar usuário no Supabase Auth.' };
        }
      }

      if (!authUserId) {
        return { sucesso: false, erro: 'Falha ao obter ID do usuário no Supabase Auth.' };
      }

      const passwordHash = await bcrypt.hash(senhaValida, 10);

      // Salvar registro na tabela pública User (profiles)
      await prisma.user.create({
        data: {
          id: authUserId,
          name: dados.nome,
          email: emailNormalizado,
          cpf: dados.cpf,
          roleId: dbRole.id,
          password: passwordHash,
          status: 'ACTIVE'
        }
      });

      // Gravar AuditLog corporativo
      const administrador = await obterUsuarioSessao();
      let logUserId = administrador?.id;

      if (!logUserId) {
        const fallbackUser = await prisma.user.findFirst({
          where: { role: { name: 'ADMIN' } }
        });
        logUserId = fallbackUser?.id || authUserId;
      }

      await prisma.auditLog.create({
        data: {
          userId: logUserId,
          action: 'CADASTRO_OPERADOR',
          entity: 'User',
          description: 'Acesso de colaborador criado pelo administrador.'
        }
      });

      return { sucesso: true };
    }

    return { sucesso: true };
  } catch (error: any) {
    console.error("Erro ao salvar usuario:", error);
    return { sucesso: false, erro: error.message };
  }
}

export async function alternarStatusUsuario(id: string, statusAtual: string) {
  try {
    const novoStatus = statusAtual === 'ATIVO' ? 'INACTIVE' : 'ACTIVE';
    await prisma.user.update({
      where: { id },
      data: { status: novoStatus }
    });
    return { sucesso: true };
  } catch (error: any) {
    console.error("Erro ao alternar status:", error);
    return { sucesso: false, erro: error.message };
  }
}

export async function excluirUsuario(id: string) {
  try {
    await prisma.user.delete({
      where: { id }
    });
    return { sucesso: true };
  } catch (error: any) {
    console.error("Erro ao excluir usuario:", error);
    return { sucesso: false, erro: error.message };
  }
}
