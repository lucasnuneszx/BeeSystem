'use client';

import React, { useState, useEffect } from 'react';
import { usarAutenticacao } from '@/context/AuthContext';
import {
  LayoutDashboard, Users, ShoppingCart, Package,
  QrCode, ClipboardCheck, History, Settings,
  LogOut, Menu, X, ChevronRight, User as IconeUsuario,
  PieChart, AlertCircle, Search, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { encerrarSessao } from '@/app/actions/usuarios';

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
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      className={`
        flex items-center gap-3 p-3 rounded-xl cursor-pointer
        transition-all duration-200 group
        ${ativo ? 'bg-[#ffcc00] text-black shadow-[0_4px_12px_rgba(255,204,0,0.2)]' : 'text-muted-foreground hover:bg-white/[0.03] hover:text-white'}
      `}
    >
      <span className={`${ativo ? 'text-black' : 'group-hover:text-[#ffcc00] transition-colors'}`}>
        {icone}
      </span>
      <AnimatePresence>
        {!recolhido && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="font-bold text-xs uppercase tracking-wider whitespace-nowrap"
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
          <ChevronRight className="w-4 h-4 text-black" />
        </motion.div>
      )}
    </motion.div>
  </Link>
);

export function AppShell({ children }: { children: React.ReactNode }) {
  const { usuario, sair } = usarAutenticacao();
  const [recolhido, setRecolhido] = useState(false);
  const [menuMovelAberto, setMenuMovelAberto] = useState(false);
  const [tempoAtual, setTempoAtual] = useState('');
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);
  const caminhoAtual = usePathname();
  const router = useRouter();

  // Relógio corporativo em tempo real
  useEffect(() => {
    const atualizarTempo = () => {
      const agora = new Date();
      setTempoAtual(agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    atualizarTempo();
    const interval = setInterval(atualizarTempo, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!usuario) return (
    <div className="min-h-screen bg-[#050506] flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#ffcc00] border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-widest text-[#ffcc00]">Sincronizando Sessão...</span>
      </div>
    </div>
  );

  const perfil = usuario.perfil;

  // Organização dos links em grupos temáticos (Padrão Enterprise)
  const categoriasMenu = [
    {
      titulo: 'Geral',
      itens: [
        { rotulo: 'Dashboard', icone: <LayoutDashboard size={18} />, link: '/dashboard', perfis: ['ADMIN', 'GERENTE', 'VENDEDOR', 'OFICIAL'] }
      ]
    },
    {
      titulo: 'Gestão & Auditoria',
      itens: [
        { rotulo: 'Colaboradores', icone: <Users size={18} />, link: '/admin/usuarios', perfis: ['ADMIN', 'GERENTE'] },
        { rotulo: 'Painel Gerencial', icone: <PieChart size={18} />, link: '/gerencial/monitoramento', perfis: ['ADMIN', 'GERENTE'] },
        { rotulo: 'Log de Auditoria', icone: <History size={18} />, link: '/gerencial/auditoria', perfis: ['ADMIN', 'GERENTE'] },
      ]
    },
    {
      titulo: 'Operações Vendas',
      itens: [
        { rotulo: 'Criar Pedido', icone: <ShoppingCart size={18} />, link: '/vendas/novo-pedido', perfis: ['ADMIN', 'VENDEDOR'] },
        { rotulo: 'Despachar / Saída', icone: <LogOut size={18} />, link: '/vendas/saida', perfis: ['ADMIN', 'VENDEDOR'] },
        { rotulo: 'Histórico Pedidos', icone: <ClipboardCheck size={18} />, link: '/vendas/historico', perfis: ['ADMIN', 'VENDEDOR'] },
      ]
    },
    {
      titulo: 'Operações Galpão',
      itens: [
        { rotulo: 'Entrada / QR Code', icone: <QrCode size={18} />, link: '/galpao/recebimento', perfis: ['ADMIN', 'OFICIAL'] },
        { rotulo: 'Mapa de Estoque', icone: <Search size={18} />, link: '/galpao/mapa-estoque', perfis: ['ADMIN', 'OFICIAL'] },
        { rotulo: 'Disparidades', icone: <AlertCircle size={18} />, link: '/galpao/disparidade', perfis: ['ADMIN', 'OFICIAL'] },
      ]
    }
  ];

  // Filtra categorias e itens conforme perfil RBAC do colaborador
  const categoriasFiltradas = categoriasMenu.map(cat => ({
    ...cat,
    itens: cat.itens.filter(item => item.perfis.includes(perfil))
  })).filter(cat => cat.itens.length > 0);

  const handleLogout = async () => {
    try {
      await encerrarSessao();
    } catch (e) {
      console.warn('Erro ao limpar sessão no servidor, limpando localmente.', e);
    }
    sair();
    router.push('/login');
  };

  return (
    <div className="flex h-screen w-screen bg-[#050506] text-white overflow-hidden relative">
      {/* Background Decorativo */}
      <div className="absolute inset-0 bg-beesystem opacity-[0.03] pointer-events-none" />
      <div className="honeycomb-overlay opacity-[0.05] pointer-events-none" />

      {/* Menu Lateral Desktop */}
      <motion.aside
        initial={false}
        animate={{ width: recolhido ? 88 : 280 }}
        className="hidden md:flex flex-col border-r border-white/[0.05] bg-[#090e16]/80 backdrop-blur-xl z-20 transition-all duration-300 relative"
      >
        {/* Logo Corporativo VoltGuard/BeeSystem */}
        <div className="p-6 flex items-center gap-3 border-b border-white/[0.03] h-20">
          <div className="w-10 h-10 rounded-xl bg-[#ffcc00]/10 flex items-center justify-center border border-[#ffcc00]/20 flex-shrink-0">
            <img src="/cybernetic_bee.png" alt="BeeSystem Logo" className="w-7 h-7 object-contain rounded-md" />
          </div>
          {!recolhido && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col"
            >
              <span className="text-sm font-black tracking-tighter leading-none">BEE<span className="text-[#ffcc00]">SYSTEM</span></span>
              <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-[0.2em] mt-1">VOLTGUARD LOGISTICS</span>
            </motion.div>
          )}
        </div>

        {/* Itens do Menu Navegação Agrupados */}
        <div className="flex-1 px-4 py-6 space-y-6 custom-scrollbar overflow-y-auto">
          {categoriasFiltradas.map((cat) => (
            <div key={cat.titulo} className="space-y-2">
              {!recolhido && (
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground px-3 opacity-45">
                  {cat.titulo}
                </p>
              )}
              {recolhido && (
                <div className="h-px bg-white/[0.05] my-4 mx-3" />
              )}
              <div className="space-y-1">
                {cat.itens.map((item) => (
                  <ItemLateral
                    key={item.link}
                    {...item}
                    ativo={caminhoAtual === item.link}
                    recolhido={recolhido}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Rodapé Lateral: Toggle e Logout */}
        <div className="p-4 border-t border-white/[0.03] space-y-2">
          <button
            onClick={() => setRecolhido(!recolhido)}
            className="w-full flex items-center gap-3 p-3 text-muted-foreground hover:text-white hover:bg-white/[0.02] rounded-xl transition-all font-bold text-xs uppercase tracking-wider"
          >
            {recolhido ? <ChevronRight size={18} /> : <Menu size={18} />}
            {!recolhido && <span>Ocultar Menu</span>}
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-xl transition-all font-bold text-xs uppercase tracking-wider"
          >
            <LogOut size={18} />
            {!recolhido && <span>Encerrar Turno</span>}
          </button>
        </div>
      </motion.aside>

      {/* Área de Conteúdo Principal */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Barra Superior */}
        <header className="h-20 border-b border-white/[0.05] bg-[#090e16]/40 backdrop-blur-md px-8 flex items-center justify-between z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMenuMovelAberto(true)}
              className="md:hidden p-2 hover:bg-white/[0.05] rounded-lg text-muted-foreground"
            >
              <Menu size={20} />
            </button>

            <div className="hidden md:block">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ffcc00]">Navegação</span>
              <h2 className="text-lg font-black uppercase italic tracking-tighter leading-none mt-1">
                {caminhoAtual.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
              </h2>
            </div>
          </div>

          {/* Widgets Globais (Relógio, Alertas e Usuário) */}
          <div className="flex items-center gap-6">
            {/* Relógio Enterprise */}
            <div className="hidden lg:flex flex-col text-right border-r border-white/[0.05] pr-6">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Hora Turno</span>
              <span className="text-sm font-mono font-bold text-[#ffcc00] mt-0.5">{tempoAtual || '--:--:--'}</span>
            </div>

            {/* Badge de Notificações / Alertas */}
            <div className="relative">
              <button 
                onClick={() => setNotificacoesAbertas(!notificacoesAbertas)}
                className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl text-muted-foreground hover:text-white transition-all relative"
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              </button>
              
              <AnimatePresence>
                {notificacoesAbertas && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotificacoesAbertas(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-80 bg-[#090e16] border border-white/10 rounded-2xl shadow-3xl z-50 p-5 space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-white/[0.05] pb-3">
                        <span className="text-xs font-black uppercase tracking-widest">Alertas de Validade</span>
                        <span className="text-[9px] bg-red-500/10 text-red-400 px-2.5 py-0.5 rounded-full font-bold">1 Ativo</span>
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10 space-y-1">
                          <p className="text-xs font-bold text-red-400">RN01: Validade Crítica Detectada</p>
                          <p className="text-[10px] text-muted-foreground">Lote VG-002 atingiu a data limite e foi bloqueado para saída.</p>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Avatar do Operador */}
            <div className="flex items-center gap-4 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black uppercase tracking-wider text-white leading-none">{usuario.nome}</p>
                <p className="text-[9px] text-[#ffcc00] font-black uppercase tracking-widest mt-1.5">{usuario.perfil}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-white/[0.02] border border-[#ffcc00]/20 flex items-center justify-center text-[#ffcc00] shadow-[0_0_15px_rgba(255,204,0,0.05)] relative group">
                <IconeUsuario size={18} />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-[#050506] animate-pulse" />
              </div>
            </div>
          </div>
        </header>

        {/* Painel do Conteúdo */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={caminhoAtual}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Menu Lateral Mobile */}
      <AnimatePresence>
        {menuMovelAberto && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuMovelAberto(false)}
              className="fixed inset-0 bg-[#050506]/85 backdrop-blur-sm z-30 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-[#090e16] border-r border-white/10 z-40 md:hidden flex flex-col p-6"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <img src="/cybernetic_bee.png" alt="Logo" className="w-8 h-8 object-contain rounded-md" />
                  <span className="text-sm font-black tracking-tighter">BEE<span className="text-[#ffcc00]">SYSTEM</span></span>
                </div>
                <button onClick={() => setMenuMovelAberto(false)} className="p-2 hover:bg-white/[0.05] rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 space-y-6 overflow-y-auto">
                {categoriasFiltradas.map((cat) => (
                  <div key={cat.titulo} className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground px-3 opacity-40">
                      {cat.titulo}
                    </p>
                    <div className="space-y-1">
                      {cat.itens.map((item) => (
                        <ItemLateral
                          key={item.link}
                          {...item}
                          ativo={caminhoAtual === item.link}
                          recolhido={false}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-6 border-t border-white/[0.05] mt-auto">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-500/5 rounded-xl transition-all font-bold text-xs uppercase tracking-wider"
                >
                  <LogOut size={18} />
                  <span>Encerrar Turno</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
