'use client';

import React, { useState } from 'react';
import { usarAutenticacao } from '@/context/AuthContext';
import { 
  LayoutDashboard, Users, ShoppingCart, Package, 
  QrCode, ClipboardCheck, History, Settings,
  LogOut, Menu, X, ChevronRight, User as IconeUsuario,
  PieChart, AlertCircle, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface PropriedadesItemLateral {
  icone: React.ReactNode;
  rotulo: string;
  link: string;
  ativo: boolean;
  recolhido: boolean;
}

const ItemLateral = ({ icone, rotulo, link, ativo, recolhido }: PropriedadesItemLateral) => (
  <Link href={link}>
    <motion.div 
      whileHover={{ scale: 1.02, x: 5 }}
      whileTap={{ scale: 0.98 }}
      className={`
        flex items-center gap-3 p-3 rounded-xl cursor-pointer
        transition-all duration-200 group
        ${ativo ? 'glass-accent text-primary' : 'text-muted-foreground hover:bg-surface hover:text-white'}
      `}
    >
      <span className={`${ativo ? 'text-primary' : 'group-hover:text-primary transition-colors'}`}>
        {icone}
      </span>
      <AnimatePresence>
        {!recolhido && (
          <motion.span 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="font-medium whitespace-nowrap"
          >
            {rotulo}
          </motion.span>
        )}
      </AnimatePresence>
      {ativo && !recolhido && (
        <motion.div 
          layoutId="sidebar-active"
          className="ml-auto"
        >
          <ChevronRight className="w-4 h-4" />
        </motion.div>
      )}
    </motion.div>
  </Link>
);

export function AppShell({ children }: { children: React.ReactNode }) {
  const { usuario, entrar } = usarAutenticacao();
  const [recolhido, setRecolhido] = useState(false);
  const [menuMovelAberto, setMenuMovelAberto] = useState(false);
  const caminhoAtual = usePathname();

  if (!usuario) return <div className="min-h-screen bg-background flex items-center justify-center text-white">Carregando...</div>;

  const perfil = usuario.perfil;

  const itensMenu = [
    { rotulo: 'Dashboard', icone: <LayoutDashboard size={20} />, link: '/dashboard', perfis: ['GERENTE', 'VENDEDOR'] },
    
    // Área do Gerente
    { rotulo: 'Gestão Usuários', icone: <Users size={20} />, link: '/admin/usuarios', perfis: ['GERENTE'] },
    { rotulo: 'Monitoramento', icone: <PieChart size={20} />, link: '/gerencial/monitoramento', perfis: ['GERENTE'] },
    { rotulo: 'Auditoria', icone: <History size={20} />, link: '/gerencial/auditoria', perfis: ['GERENTE'] },
    
    // Área do Vendedor
    { rotulo: 'Criar Pedido', icone: <ShoppingCart size={20} />, link: '/vendas/novo-pedido', perfis: ['VENDEDOR'] },
    { rotulo: 'Checkout / Saída', icone: <LogOut size={20} />, link: '/vendas/saida', perfis: ['VENDEDOR'] },
    { rotulo: 'Meus Pedidos', icone: <ClipboardCheck size={20} />, link: '/vendas/historico', perfis: ['VENDEDOR'] },
    
    // Área do Galpão (Oficial)
    { rotulo: 'Recebimento', icone: <QrCode size={20} />, link: '/galpao/recebimento', perfis: ['OFICIAL'] },
    { rotulo: 'Mapa de Estoque', icone: <Search size={20} />, link: '/galpao/mapa-estoque', perfis: ['OFICIAL'] },
    { rotulo: 'Disparidades', icone: <AlertCircle size={20} />, link: '/galpao/disparidade', perfis: ['OFICIAL'] },
  ].filter(item => item.perfis.includes(perfil));

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden">
      {/* Menu Lateral Desktop */}
      <motion.aside 
        initial={false}
        animate={{ width: recolhido ? 80 : 280 }}
        className="hidden md:flex flex-col border-r border-border bg-background bg-honeycomb z-20 transition-all duration-500"
      >
        <div className="p-6 flex items-center justify-between">
          {!recolhido && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <img src="https://i.imgur.com/x7ATSJy.png" alt="BEESYSTEM" className="h-12 w-auto object-contain" />
            </motion.div>
          )}
          {recolhido && (
            <img src="https://i.imgur.com/x7ATSJy.png" alt="B" className="w-8 h-8 object-contain mx-auto" />
          )}
        </div>

        <div className="flex-1 px-4 space-y-2 py-4 custom-scrollbar overflow-y-auto">
          {itensMenu.map((item) => (
            <ItemLateral 
              key={item.link}
              {...item}
              ativo={caminhoAtual === item.link}
              recolhido={recolhido}
            />
          ))}
        </div>

        <div className="p-4 border-t border-border mt-auto">
          <button 
            onClick={() => setRecolhido(!recolhido)}
            className="w-full flex items-center gap-3 p-3 text-muted-foreground hover:text-white transition-colors"
          >
            {recolhido ? <ChevronRight size={20} /> : <Menu size={20} />}
            {!recolhido && <span>Recolher</span>}
          </button>
        </div>
      </motion.aside>

      {/* Área Principal */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Barra Superior */}
        <header className="h-20 border-b border-border glass px-8 flex items-center justify-between z-10 sticky top-0">
          <button 
            onClick={() => setMenuMovelAberto(true)}
            className="md:hidden p-2 text-muted-foreground"
          >
            <Menu size={24} />
          </button>

          <div className="hidden md:block">
            <h2 className="text-lg font-semibold capitalize">
              {caminhoAtual.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            {/* Seletor de Perfis para Demonstração */}
            <div className="hidden lg:flex items-center gap-2 p-1 bg-surface rounded-full border border-border">
               {(['GERENTE', 'VENDEDOR', 'OFICIAL'] as const).map((p) => (
                 <button
                  key={p}
                  onClick={() => entrar(p)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all uppercase ${perfil === p ? 'bg-primary text-background' : 'text-muted-foreground hover:text-white'}`}
                 >
                  {p}
                 </button>
               ))}
            </div>

            <div className="flex items-center gap-4 border-l border-border pl-6">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold">{usuario.nome}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">{usuario.perfil}</p>
              </div>
              <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-primary border border-primary/20">
                <IconeUsuario size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Conteúdo com ScrollReveal */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={caminhoAtual}
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02, y: -15 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Fundo do Menu Mobile */}
      <AnimatePresence>
        {menuMovelAberto && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenuMovelAberto(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Menu Movel */}
      <AnimatePresence>
        {menuMovelAberto && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-72 bg-background border-r border-border z-40 md:hidden p-6"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <img src="https://i.imgur.com/x7ATSJy.png" alt="BEESYSTEM" className="h-10 w-auto object-contain" />
              </div>
              <button onClick={() => setMenuMovelAberto(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="space-y-2">
              {itensMenu.map((item) => (
                <ItemLateral 
                  key={item.link}
                  {...item}
                  ativo={caminhoAtual === item.link}
                  recolhido={false}
                />
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
