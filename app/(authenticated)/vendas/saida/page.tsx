'use client';

import React, { useState, useEffect } from 'react';
import { 
  Package, CheckCircle2, AlertTriangle, 
  Search, Truck, ShieldCheck, List, Database,
  Barcode, ArrowRight, X, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usarNotificacao } from '@/context/NotificacaoContext';
import { listarPedidos } from '@/app/actions/gerencial';

// Fila de Espera Externa BeeSystem (RF14 - Saída)
const saidasMockadas = [
    { id: 'S1', codigo: 'PED-1025', cliente: 'Padaria Central', status: 'APROVADO', itens: [{ nome: 'Mel Silvestre 500g', qtd: 50, validade: '2025-12-30' }], data: 'Hoje' },
    { id: 'S2', codigo: 'PED-1027', cliente: 'Supermercado Elite', status: 'APROVADO', itens: [{ nome: 'Própolis Verde 30ml', qtd: 200, validade: '2025-10-15' }], data: 'Ontem' },
    { id: 'S3', codigo: 'PED-1030', cliente: 'Exportadora Global', status: 'APROVADO', itens: [{ nome: 'Geleia Real 20g', qtd: 10, validade: '2026-01-20' }], data: 'Há 2 dias' },
];

export default function PaginaSaidaEstoque() {
  const { notificar } = usarNotificacao();
  const [carregando, setCarregando] = useState(false);
  const [saidas, setSaidas] = useState(saidasMockadas);
  const [termoBusca, setTermoBusca] = useState('');
  const [itemSelecionado, setItemSelecionado] = useState<any>(null);
  const [bipando, setBipando] = useState(false);

  const carregarAprovados = async () => {
    setCarregando(true);
    try {
      const lista = await listarPedidos();
      const aprovados = (lista || []).filter(p => p.status === 'APROVADO');
      if (aprovados.length > 0) setSaidas(aprovados);
    } catch (e) {
      console.warn('Operando com fila de contingência visual.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarAprovados();
  }, []);

  const handleSimularBipagem = (id: string) => {
    setBipando(true);
    notificar('Auditando validade do lote...', 'info');
    
    setTimeout(() => {
      setBipando(false);
      notificar('Lote validado! Saída autorizada pela colmeia.', 'sucesso');
      setSaidas(saidas.filter(s => s.id !== id));
      setItemSelecionado(null);
    }, 1500);
  };

  const saidasFiltradas = saidas.filter(s => s.codigo.toLowerCase().includes(termoBusca.toLowerCase()) || s.cliente.toLowerCase().includes(termoBusca.toLowerCase()));

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3 italic leading-none uppercase">
            <Truck size={36} className="text-primary" /> SAÍDA DE ESTOQUE
          </h1>
          <p className="text-muted-foreground uppercase text-xs tracking-widest italic opacity-60 mt-1">Sincronizado com Ecossistema BeeSystem</p>
        </div>
        <button onClick={carregarAprovados} className="glass px-6 py-4 rounded-[2rem] border border-primary/20 text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-primary hover:text-background transition-all">
          <Database size={18} className={carregando ? 'animate-spin' : ''} /> 
          Sincronizar Banco
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Buscar por Pedido ou Cliente Aprovado..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="w-full bg-surface border border-white/5 rounded-[2.5rem] pl-16 pr-8 py-5 outline-none focus:border-primary/50 transition-all font-bold text-lg shadow-inner"
              />
           </div>

           <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {saidasFiltradas.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 opacity-30 italic glass rounded-[3rem] shadow-xl">
                     <Package size={64} className="mx-auto mb-4" />
                     <p className="font-bold">Nenhuma saída pendente na auditoria.</p>
                  </motion.div>
                ) : saidasFiltradas.map((item, i) => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setItemSelecionado(item)}
                    className={`glass p-8 rounded-[3rem] border cursor-pointer group hover:scale-[1.01] transition-all shadow-xl ${itemSelecionado?.id === item.id ? 'border-primary/50 bg-primary/5 ring-2 ring-primary/20' : 'border-white/5 border-transparent'}`}
                  >
                     <div className="flex justify-between items-center">
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                              <Barcode size={32} />
                           </div>
                           <div>
                              <p className="text-2xl font-black italic tracking-tighter text-primary leading-none uppercase">{item.codigo}</p>
                              <p className="text-lg font-bold text-white mt-1">{item.cliente}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Status Auditoria</p>
                           <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">LIBERADO</span>
                        </div>
                     </div>
                  </motion.div>
                ))}
              </AnimatePresence>
           </div>
        </div>

        <div className="space-y-6">
           <AnimatePresence mode="wait">
              {itemSelecionado ? (
                <motion.div 
                  key="detail"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass p-10 rounded-[3.5rem] border border-white/5 space-y-8 shadow-2xl relative overflow-hidden"
                >
                   <div className="flex items-center justify-between pb-6 border-b border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary shadow-inner"><Truck size={24} /></div>
                        <h3 className="text-xl font-black italic tracking-tighter">ROMANEIO SAÍDA</h3>
                      </div>
                      <button onClick={() => setItemSelecionado(null)} className="p-2 glass rounded-xl hover:text-red-500 transition-all"><X size={20} /></button>
                   </div>

                   <div className="space-y-6">
                      <div className="space-y-1">
                         <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Destinatário Corporativo</p>
                         <p className="text-2xl font-black text-white italic tracking-tighter">{itemSelecionado.cliente}</p>
                      </div>

                      <div className="space-y-4">
                         <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Itens para Auditoria de Validada (FIFO)</p>
                         {itemSelecionado.itens.map((sub: any, i: number) => (
                           <div key={i} className="bg-surface/50 border border-white/5 p-6 rounded-3xl space-y-3">
                              <div className="flex justify-between items-center">
                                 <p className="font-bold text-lg leading-tight uppercase italic">{sub.nome}</p>
                                 <p className="font-black text-primary text-xl tabular-nums tracking-tighter">x{sub.qtd}</p>
                              </div>
                              <div className="flex items-center gap-3 text-sm font-bold opacity-60">
                                 <Clock size={16} />
                                 <span>Validade: <span className="text-white">{sub.validade}</span></span>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>

                   <button 
                     onClick={() => handleSimularBipagem(itemSelecionado.id)}
                     disabled={bipando}
                     className="w-full bg-primary text-background py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                   >
                     {bipando ? 'AUDITANDO LOTE...' : <><Barcode size={18}/> BIPAR SAÍDA</>}
                   </button>
                   
                   <p className="text-center text-[8px] font-black uppercase tracking-[0.3em] opacity-30 italic">O oficial deve bipar cada caixa individualmente conforme RF14.</p>
                </motion.div>
              ) : (
                <motion.div 
                   key="idle"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="glass p-20 rounded-[3.5rem] border border-white/5 flex flex-col items-center justify-center text-center space-y-6 opacity-30 shadow-xl"
                >
                   <Truck size={64} className="text-primary mb-4" />
                   <p className="font-bold text-xl uppercase tracking-tighter italic">Selecione um pedido para iniciar a auditoria de saída.</p>
                </motion.div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
