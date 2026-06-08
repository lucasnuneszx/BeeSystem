'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

import { autenticarUsuario, obterSessaoAtual } from '@/app/actions/usuarios';

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
  entrar: (email: string, senha?: string) => Promise<{ sucesso: boolean; mensagem?: string }>;
  sair: () => void;
}

const ContextoAutenticacao = createContext<TipoContextoAutenticacao | undefined>(undefined);

const mapRoleToPerfil = (role: string): Perfil => {
  const map: Record<string, Perfil> = {
    'ADMIN': 'ADMIN',
    'MANAGER': 'GERENTE',
    'SELLER': 'VENDEDOR',
    'OFFICER': 'OFICIAL'
  };
  return map[role] || 'VENDEDOR';
};

export function ProvedorAutenticacao({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const inicializarSessao = async () => {
      try {
        const sessao = await obterSessaoAtual();
        if (sessao) {
          const mappedUser: Usuario = {
            id: sessao.id,
            nome: sessao.nome,
            email: sessao.email,
            cpf: sessao.cpf,
            perfil: mapRoleToPerfil(sessao.role)
          };
          setUsuario(mappedUser);
          localStorage.setItem('beesystem_usuario', JSON.stringify(mappedUser));
        } else {
          setUsuario(null);
          localStorage.removeItem('beesystem_usuario');
        }
      } catch (e) {
        setUsuario(null);
        localStorage.removeItem('beesystem_usuario');
      } finally {
        setCarregando(false);
      }
    };
    inicializarSessao();
  }, []);

  const entrar = async (email: string, senha: string = '') => {
    setCarregando(true);
    try {
      const res = await autenticarUsuario(email, senha);
      if (res.sucesso && res.usuario) {
        const mappedUser: Usuario = {
          id: res.usuario.id,
          nome: res.usuario.nome,
          email: res.usuario.email,
          cpf: res.usuario.cpf,
          perfil: mapRoleToPerfil(res.usuario.role)
        };
        setUsuario(mappedUser);
        localStorage.setItem('beesystem_usuario', JSON.stringify(mappedUser));
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
