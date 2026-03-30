'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Perfil = 'GERENTE' | 'VENDEDOR' | 'OFICIAL';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: Perfil;
  cpf: string;
}

interface TipoContextoAutenticacao {
  usuario: Usuario | null;
  entrar: (perfil: Perfil) => void;
  sair: () => void;
}

const usuariosFake: Record<Perfil, Usuario> = {
  GERENTE: {
    id: 'u-1',
    nome: 'Ana Gerente',
    email: 'ana@beesystem.com',
    perfil: 'GERENTE',
    cpf: '123.456.789-00'
  },
  VENDEDOR: {
    id: 'u-2',
    nome: 'Bruno Vendedor',
    email: 'bruno@beesystem.com',
    perfil: 'VENDEDOR',
    cpf: '987.654.321-11'
  },
  OFICIAL: {
    id: 'u-3',
    nome: 'Carlos Oficial',
    email: 'carlos@beesystem.com',
    perfil: 'OFICIAL',
    cpf: '555.444.333-22'
  }
};

const ContextoAutenticacao = createContext<TipoContextoAutenticacao | undefined>(undefined);

export function ProvedorAutenticacao({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    // Iniciar como Gerente para demonstração
    setUsuario(usuariosFake.GERENTE);
  }, []);

  const entrar = (perfil: Perfil) => {
    setUsuario(usuariosFake[perfil]);
  };

  const sair = () => {
    setUsuario(null);
  };

  return (
    <ContextoAutenticacao.Provider value={{ usuario, entrar, sair }}>
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
