'use client';

import React, { useState } from 'react';
import { 
  Scan, Package, CheckCircle2, AlertTriangle, 
  History, QrCode, Search, Database, 
  ArrowRight, Truck, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usarNotificacao } from '@/context/NotificacaoContext';
import { registrarRecebimento } from '@/app/actions/galpao';

// Cargas Esperadas (Fidelidade Operacional RF05)
const cargasEsperadas = [
    { id: 'C1', fornecedor: 'Apicultura Central', itens: [{ nome: 'Mel 500g', qtd: 500 }], remessa: 'NF-9982' },
    { id: 'C2', fornecedor: 'Própolis Brasil', itens: [{ nome: 'Própolis 30ml', qtd: 1000 }], remessa: 'NF-9990' },
];

export default function PaginaRecebimentoCarga() {
  const { notificar } = usarNotificacao();
  const [bipando, setBipando] = useState(false);
  const [etapa, setEtapa] = useState<'IDLE' | 'READING' | 'SUCCESS'>('IDLE');
  const [cargas, setCargas] = useState(cargasEsperadas);

  const handleSimularScan = async (id: string) => {
    setBipando(true);
    setEtapa('READING');
    notificar('Sincronizando com Banco Corporativo via QR...', 'info');
    
    // Simulação de delay industrial
    setTimeout(async () => {
      try {
        const res = await registrarRecebimento('LOT-SCAN-' + Math.floor(Math.random() * 1000));
        if (res.sucesso) {
            notificar('Lote registrado no banco!', 'sucesso');
            setCargas(cargas.filter(c => c.id !== id));
            setEtapa('SUCCESS');
        } else {
            notificar('Registrado no Vôo Manual (Local).', 'info');
            setCargas(cargas.filter(c => c.id !== id));
            setEtapa('SUCCESS');
        }
      } catch (e) {
        notificar('Erro na comunicação com a colmeia.', 'erro');
      } finally {
        setBipando(false);
      }
    }, 2000);
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="space-y-1">
        <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3 italic leading-none uppercase">
          <Scan size={36} className="text-primary" /> RECEBIMENTO DE CARGA
        </h1>
        <p className="text-muted-foreground uppercase text-xs tracking-widest italic opacity-60 mt-1">Auditório de Entrada do Ecossistema BeeSystem</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
           <h2 className="text-xl font-black italic tracking-tighter uppercase flex items-center gap-3 opacity-60">
              <Truck size={20} /> FILA DE DESEMBARQUE ATUAL
           </h2>
           <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {cargas.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 opacity-30 italic glass rounded-[3rem] shadow-xl">
                     <CheckCircle2 size={64} className="mx-auto mb-4 text-green-500" />
                     <p className="font-bold">Todos os desembarques concluídos.</p>
                  </motion.div>
                ) : cargas.map((carga, index) => (
                  <motion.div 
                    key={carga.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass p-8 rounded-[3rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-primary/30 transition-all shadow-xl"
                  >
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-surface rounded-[1.5rem] flex items-center justify-center text-muted-foreground shadow-inner group-hover:text-primary transition-colors">
                           <Database size={28} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-primary italic mb-1">{carga.remessa}</p>
                           <h3 className="text-2xl font-black italic tracking-tighter text-white leading-none">{carga.fornecedor}</h3>
                           <p className="text-xs font-bold text-muted-foreground mt-2 uppercase tracking-widest">{carga.itens[0].qtd}un - {carga.itens[0].nome}</p>
                        </div>
                     </div>
                     <button 
                        onClick={() => handleSimularScan(carga.id)}
                        className="bg-primary text-background px-8 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/20"
                     >
                        <QrCode size={18} /> INICIAR BIPAGEM
                     </button>
                  </motion.div>
                ))}
              </AnimatePresence>
           </div>
        </div>

        <div className="space-y-6">
           <div className="glass p-10 rounded-[3.5rem] border border-white/5 relative overflow-hidden min-h-[500px] flex flex-col shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32" />
              
              <div className="relative z-10 flex-1 flex flex-col">
                 {etapa === 'IDLE' && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in duration-500">
                       <div className="w-32 h-32 rounded-[2.5rem] bg-surface flex items-center justify-center text-muted-foreground border border-white/5 shadow-inner opacity-40">
                          <Scan size={64} />
                       </div>
                       <div className="max-w-xs">
                          <h4 className="text-2xl font-black italic tracking-tighter uppercase mb-3">Aguardando Scanner</h4>
                          <p className="text-sm font-bold opacity-40 uppercase tracking-widest">Bipe a etiqueta do lote para confirmar a entrada no estoque.</p>
                       </div>
                    </div>
                 )}

                 {etapa === 'READING' && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-300">
                       <div className="relative">
                          <div className="w-48 h-48 border-4 border-dashed border-primary/40 rounded-[2.5rem] animate-[spin_10s_linear_infinite]" />
                          <div className="absolute inset-0 flex items-center justify-center">
                             <QrCode size={64} className="text-primary animate-pulse" />
                          </div>
                       </div>
                       <div>
                          <h4 className="text-3xl font-black italic tracking-tighter uppercase mb-4 text-primary animate-pulse">Sincronizando...</h4>
                          <div className="flex gap-2 justify-center">
                             <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                             <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                             <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                          </div>
                       </div>
                    </div>
                 )}

                 {etapa === 'SUCCESS' && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in cubic-bezier(0.2, 0.8, 0.2, 1) slide-in-from-bottom-10 duration-500">
                       <div className="w-32 h-32 rounded-full bg-green-500 flex items-center justify-center text-background text-6xl shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                          <CheckCircle2 size={64} />
                       </div>
                       <div className="space-y-4">
                          <h4 className="text-4xl font-black italic tracking-tighter uppercase">Lote Auditado!</h4>
                          <div className="p-6 bg-surface/50 rounded-3xl border border-green-500/20 text-green-400 font-black text-[10px] uppercase tracking-widest shadow-inner">
                            Endereçamento sugerido: <span className="text-white ml-2">GALPÃO A - PRATELEIRA 04</span>
                          </div>
                          <button onClick={() => setEtapa('IDLE')} className="text-primary font-black text-xs uppercase tracking-widest mt-6 hover:underline underline-offset-8">Finalizar Auditoria</button>
                       </div>
                    </div>
                 )}
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 relative z-10 flex gap-6 italic">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500"><AlertTriangle size={16} /></div>
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Validade Min: 180 Dias</p>
                </div>
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><MapPin size={16} /></div>
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Setor: Meliponário</p>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
