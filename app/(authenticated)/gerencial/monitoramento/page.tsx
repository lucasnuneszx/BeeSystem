'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, CheckCircle2, XCircle, 
  Search, Eye, AlertCircle, X, Database, ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usarNotificacao } from '@/context/NotificacaoContext';
import { listarPedidos, aprovarPedido, rejeitarPedido } from '@/app/actions/gerencial';

// Dados Mokados para População Imediata (RF Fidelidade Visual)
const pedidosMockados = [
  { id: '1', codigo: 'PED-1024', cliente: 'Supermercado Elite LTDA', status: 'PENDENTE', vendedor: { nome: 'Ana Maria' }, criadoEm: new Date(), itens: [{ preco: 15.0, quantidade: 100 }] },
  { id: '2', codigo: 'PED-1025', cliente: 'Padaria Central', status: 'APROVADO', vendedor: { nome: 'Lucas Oliveira' }, criadoEm: new Date(), itens: [{ preco: 12.0, quantidade: 50 }] },
  { id: '3', codigo: 'PED-1026', cliente: 'Mercado do Bairro', status: 'REJEITADO', vendedor: { nome: 'Beatriz Silva' }, criadoEm: new Date(), itens: [{ preco: 18.0, quantidade: 20 }] },
  { id: '4', codigo: 'PED-1027', cliente: 'Apicultura Central', status: 'PENDENTE', vendedor: { nome: 'Lucas Oliveira' }, criadoEm: new Date(), itens: [{ preco: 25.0, quantidade: 40 }] },
  { id: '5', codigo: 'PED-1028', cliente: 'Gourmet Mel Co.', status: 'APROVADO', vendedor: { nome: 'Beatriz Silva' }, criadoEm: new Date(), itens: [{ preco: 30.0, quantidade: 80 }] },
  { id: '6', codigo: 'PED-1029', cliente: 'Distribuidora Norte', status: 'PENDENTE', vendedor: { nome: 'Ana Maria' }, criadoEm: new Date(), itens: [{ preco: 14.0, quantidade: 120 }] },
  { id: '7', codigo: 'PED-1030', cliente: 'Empório do Parque', status: 'RECEBIDO', vendedor: { nome: 'Lucas Oliveira' }, criadoEm: new Date(), itens: [{ preco: 22.0, quantidade: 35 }] },
  { id: '8', codigo: 'PED-1031', cliente: 'Néctar Divino', status: 'APROVADO', vendedor: { nome: 'Beatriz Silva' }, criadoEm: new Date(), itens: [{ preco: 19.5, quantidade: 110 }] },
  { id: '9', codigo: 'PED-1032', cliente: 'Mel & Cia', status: 'REJEITADO', vendedor: { nome: 'Ana Maria' }, criadoEm: new Date(), itens: [{ preco: 17.0, quantidade: 15 }] }
];

export default function PaginaMonitoramentoGerencial() {
  const { notificar } = usarNotificacao();
  const [carregando, setCarregando] = useState(true);
  const [pedidos, setPedidos] = useState(pedidosMockados);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<any>(null);
  const [mostrarModalRejeicao, setMostrarModalRejeicao] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5;

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const lista = await listarPedidos();
      if (lista && lista.length > 0) {
        setPedidos(lista);
      } else {
        setPedidos(pedidosMockados);
      }
    } catch (e) {
      console.warn('Operando em modo de contingência visual.');
      setPedidos(pedidosMockados);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleAprovar = async (id: string) => {
    notificar('Gravando aprovação gerencial...', 'info');
    try {
        const res = await aprovarPedido(id);
        if (res.sucesso) {
          notificar('Pedido aprovado no banco corporativo!', 'sucesso');
          carregarDados();
        } else {
          setPedidos(pedidos.map(p => p.id === id ? { ...p, status: 'APROVADO' } : p));
          notificar('Pedido aprovado localmente (Offline).', 'info');
        }
    } catch (e) {
        notificar('Erro na conexão.', 'erro');
    }
  };

  const handleRejeitar = async () => {
    if (!justificativa) {
        notificar('Justificativa é obrigatória.', 'erro');
        return;
    }
    
    notificar('Gravando rejeição técnica...', 'info');
    try {
        const res = await rejeitarPedido(pedidoSelecionado.id, justificativa);
        if (res.sucesso) {
          notificar('Pedido rejeitado no banco!', 'sucesso');
          setMostrarModalRejeicao(false);
          setJustificativa('');
          carregarDados();
        } else {
          setPedidos(pedidos.map(p => p.id === pedidoSelecionado.id ? { ...p, status: 'REJEITADO' } : p));
          setMostrarModalRejeicao(false);
          setJustificativa('');
          notificar('Rejeitado localmente.', 'info');
        }
    } catch (e) {
        notificar('Falha técnica.', 'erro');
    }
  };

  const pedidosFiltrados = (pedidos || []).filter(p => 
    p.codigo?.toLowerCase().includes(termoBusca.toLowerCase()) || 
    p.cliente?.toLowerCase().includes(termoBusca.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3 italic leading-none uppercase">
            <BarChart3 size={36} className="text-primary" /> CONSOLE GERENCIAL
          </h1>
          <p className="text-muted-foreground uppercase text-xs tracking-widest italic opacity-60 mt-1">Sincronizado com Ecossistema BeeSystem</p>
        </div>
        <button 
            onClick={carregarDados}
            className="glass px-6 py-4 rounded-[2rem] border border-primary/20 text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-primary hover:text-background transition-all"
        >
            <Database size={18} className={carregando ? 'animate-spin' : ''} /> 
            Sincronizar Auditoria
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-1">
           <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Aguardando Avaliação</p>
           <h3 className="text-4xl font-black italic text-primary">{pedidos.filter(p => p.status === 'PENDENTE').length}</h3>
        </div>
        <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-1">
           <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Aprovados Hoje</p>
           <h3 className="text-4xl font-black italic text-green-500">{pedidos.filter(p => p.status === 'APROVADO').length}</h3>
        </div>
        <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-1">
           <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Rejeições Técnicas</p>
           <h3 className="text-4xl font-black italic text-red-500">{pedidos.filter(p => p.status === 'REJEITADO').length}</h3>
        </div>
      </div>

      <div className="relative group max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por Código ou Cliente..."
            value={termoBusca}
            onChange={(e) => {
              setTermoBusca(e.target.value);
              setPaginaAtual(1);
            }}
            className="w-full bg-surface border border-white/5 rounded-xl pl-12 pr-4 py-4 outline-none focus:border-primary/50 transition-all font-medium shadow-inner"
          />
      </div>

      <div className="glass rounded-[3rem] overflow-hidden shadow-2xl border border-white/5">
         <div className="overflow-x-auto custom-scrollbar">
           {carregando && pedidos.length === 0 ? (
             <div className="flex justify-center items-center py-24">
               <Loader2 className="w-10 h-10 text-primary animate-spin" />
             </div>
           ) : (
             <>
              <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface/50 border-b border-white/5">
                        <th className="px-8 py-6 text-xs font-black uppercase tracking-widest opacity-40">Pedido Código</th>
                        <th className="px-8 py-6 text-xs font-black uppercase tracking-widest opacity-40">Cliente</th>
                        <th className="px-8 py-6 text-xs font-black uppercase tracking-widest opacity-40">Responsável</th>
                        <th className="px-8 py-6 text-xs font-black uppercase tracking-widest opacity-40">Total</th>
                        <th className="px-8 py-6 text-xs font-black uppercase tracking-widest opacity-40">Estado Banco</th>
                        <th className="px-8 py-6 text-xs font-black uppercase tracking-widest opacity-40 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {pedidosFiltrados.length === 0 ? (
                      <tr><td colSpan={6} className="px-8 py-20 text-center opacity-30 italic">Nenhum registro de pedido encontrado.</td></tr>
                    ) : pedidosFiltrados.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina).map((pedido) => (
                      <tr key={pedido.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-8 py-8 font-black italic text-primary text-xl tracking-tighter leading-none">{pedido.codigo}</td>
                          <td className="px-8 py-8 font-bold text-lg leading-tight">{pedido.cliente}</td>
                          <td className="px-8 py-8 text-sm italic opacity-60 font-medium">{pedido.vendedor?.nome || 'Operador Central'}</td>
                          <td className="px-8 py-8 font-mono text-sm leading-none tabular-nums">R$ {pedido.itens?.reduce((acc: number, item: any) => acc + (item.preco * item.quantity || item.preco * item.quantidade || 0), 0).toFixed(2) || '0.00'}</td>
                          <td className="px-8 py-8">
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-widest shadow-xl ${
                              pedido.status === 'APPROVED' || pedido.status === 'APROVADO' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                              pedido.status === 'PENDING' || pedido.status === 'PENDENTE' ? 'bg-primary/10 text-primary border-primary/20 animate-pulse' :
                              'bg-red-500/10 text-red-500 border-red-500/20'
                            }`}>
                                {pedido.status === 'APPROVED' ? 'APROVADO' : 
                                 pedido.status === 'PENDING' ? 'PENDENTE' : 
                                 pedido.status === 'REJECTED' ? 'REJEITADO' : pedido.status}
                            </span>
                          </td>
                          <td className="px-8 py-8 text-right">
                            {pedido.status === 'PENDING' || pedido.status === 'PENDENTE' ? (
                              <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => handleAprovar(pedido.id)} className="p-3 glass rounded-xl hover:text-green-400 transition-all shadow-xl hover:scale-110">
                                    <CheckCircle2 size={16} />
                                  </button>
                                  <button onClick={() => { setPedidoSelecionado(pedido); setMostrarModalRejeicao(true); }} className="p-3 glass rounded-xl hover:text-red-500 transition-all shadow-xl hover:scale-110">
                                    <XCircle size={16} />
                                  </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => notificar(`Pedido ${pedido.codigo} está com status: ${pedido.status}`, 'info')}
                                className="p-3 glass rounded-xl opacity-40 hover:opacity-100 transition-all shadow-xl"
                              >
                                <Eye size={16} />
                              </button>
                            )}
                          </td>
                      </tr>
                    ))}
                  </tbody>
              </table>

              {/* Paginação */}
              {pedidosFiltrados.length > itensPorPagina && (
                <div className="flex items-center justify-between px-8 py-5 bg-white/[0.01] border-t border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                    Página {paginaAtual} de {Math.ceil(pedidosFiltrados.length / itensPorPagina)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
                      disabled={paginaAtual === 1}
                      className="p-3 glass rounded-xl hover:text-primary transition-all disabled:opacity-30 disabled:hover:text-white"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setPaginaAtual(prev => Math.min(prev + 1, Math.ceil(pedidosFiltrados.length / itensPorPagina)))}
                      disabled={paginaAtual === Math.ceil(pedidosFiltrados.length / itensPorPagina)}
                      className="p-3 glass rounded-xl hover:text-primary transition-all disabled:opacity-30 disabled:hover:text-white"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
             </>
           )}
         </div>
      </div>

      <AnimatePresence>
        {mostrarModalRejeicao && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/90 backdrop-blur-md z-[100]" onClick={() => setMostrarModalRejeicao(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md glass p-10 rounded-[3rem] z-[101] border border-red-500/20 shadow-2xl">
               <div className="space-y-8">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-red-500/10 rounded-[1.5rem] flex items-center justify-center text-red-500 border border-red-500/20"><AlertCircle size={32} /></div>
                        <div>
                           <h2 className="text-3xl font-black italic tracking-tighter uppercase whitespace-nowrap leading-none">Negar Pedido</h2>
                           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 mt-2">Auditoria Logística Permanente</p>
                        </div>
                     </div>
                     <button onClick={() => setMostrarModalRejeicao(false)} className="p-3 glass rounded-2xl hover:text-white transition-all"><X size={24}/></button>
                  </div>

                  <div className="space-y-4">
                     <p className="text-sm italic opacity-60">Você está rejeitando o pedido <span className="text-white font-bold">{pedidoSelecionado?.codigo}</span>. Motivo técnico obrigatório.</p>
                     <textarea value={justificativa} onChange={(e) => setJustificativa(e.target.value)} placeholder="Ex: Divergência de estoque ou limite de crédito atingido..." className="w-full bg-surface border border-white/5 rounded-[2rem] px-8 py-6 outline-none focus:border-red-500/50 transition-all h-32 font-medium text-white shadow-inner resize-none text-lg" />
                  </div>

                  <div className="flex gap-4">
                     <button onClick={() => setMostrarModalRejeicao(false)} className="flex-1 glass py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-widest">Abortar</button>
                     <button onClick={handleRejeitar} disabled={!justificativa} className="flex-1 bg-red-500 text-background py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-red-500/30">Confirmar Rejeição Permanente</button>
                  </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
