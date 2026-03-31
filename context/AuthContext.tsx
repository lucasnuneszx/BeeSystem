'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

import { autenticarUsuario } from '@/app/actions/usuarios';

type Perfil = 'ADMIN' | 'GERENTE' | 'VENDEDOR' | 'OFICIAL';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: Perfil;
  cpf: string;
}

interface TipoContextoAutenticacao {
  usuario: Usuario | null;
  carregando: boolean;
  entrar: (email: string) => Promise<{ sucesso: boolean; mensagem?: string }>;
  sair: () => void;
}

const ContextoAutenticacao = createContext<TipoContextoAutenticacao | undefined>(undefined);

export function ProvedorAutenticacao({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // Carregar usuário persistido
    const salvo = localStorage.getItem('beesystem_usuario');
    if (salvo) {
      setUsuario(JSON.parse(salvo));
    }
    setCarregando(false);
  }, []);

  const entrar = async (email: string) => {
    setCarregando(true);
    try {
      const res = await autenticarUsuario(email);
      if (res.sucesso && res.usuario) {
        // Compatibilidade de tipo (Prisma enum/string para Perfil TS)
        const user = res.usuario as any as Usuario;
        setUsuario(user);
        localStorage.setItem('beesystem_usuario', JSON.stringify(user));
        return { sucesso: true };
      }
      return { sucesso: false, mensagem: res.erro };
    } catch (e) {
      return { sucesso: false, mensagem: 'Falha na rede ou servidor.' };
    } finally {
      setCarregando(false);
    }
  };

  const sair = () => {
    setUsuario(null);
    localStorage.removeItem('beesystem_usuario');
  };

  return (
    <ContextoAutenticacao.Provider value={{ usuario, carregando, entrar, sair }}>
      {children}
    </ContextoAutenticacao.Provider>
  );
}

export function usarAutenticacao() {
  const contexto = useContext(ContextoAutenticacao);
  if (contexto === undefined) {
    throw new Error('usarAutenticacao deve ser usado dentro de um ProvedorAutenticacao');
  }
  return contexto;
}
