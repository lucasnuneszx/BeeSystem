'use client';

import React, { useState } from 'react';
import { 
  History, User, Activity, Clock, 
  MapPin, ShieldCheck, AlertTriangle, 
  ShoppingCart, QrCode, Search, Filter, 
  MoreVertical, Calendar, ArrowRight, Eye, Trash, FileText, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const logsAuditoriaIniciais = [
  { id: '1', usuario: 'Ana Gerente', acao: 'Aprovação de Pedido', modulo: 'Vendas', detalhe: 'Pedido PED-104 aprovado com sucesso', data: '2024-03-29 14:30', icone: <CheckCircleIcon /> },
  { id: '2', usuario: 'Bruno Vendedor', acao: 'Criação de Pedido', modulo: 'Vendas', detalhe: 'Novo item Mel de Abelha 500g adicionado ao PED-106', data: '2024-03-29 14:15', icone: <PlusIcon /> },
  { id: '3', usuario: 'Carlos Oficial', acao: 'Recebimento de Lote', modulo: 'Galpão', detalhe: 'Lote LOT-2024-B12 validado via scanner', data: '2024-03-29 13:45', icone: <QrCodeIcon /> },
  { id: '4', usuario: 'Sistema', acao: 'Alerta de Validade', modulo: 'Inteligência', detalhe: 'Lote LOT-2023-K2 identificado como vencido', data: '2024-03-30 09:00', icone: <AlertIcon /> },
];

function CheckCircleIcon() { return <div className="p-3 rounded-2xl bg-green-500/10 text-green-500 border border-green-500/20"><ShieldCheck size={20} /></div>; }
function PlusIcon() { return <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20"><ShoppingCart size={20} /></div>; }
function QrCodeIcon() { return <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20"><QrCode size={20} /></div>; }
function AlertIcon() { return <div className="p-3 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20"><AlertTriangle size={20} /></div>; }
function ShieldIcon() { return <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20"><User size={20} /></div>; }

export default function PaginaAuditoriaGerencial() {
  const [logs, setLogs] = useState(logsAuditoriaIniciais);
  const [menuAbertoId, setMenuAbertoId] = useState<string | null>(null);
  const [filtroPeriodo, setFiltroPeriodo] = useState('7 dias');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const periodos = ['7 dias', '15 dias', '30 dias', '60 dias', '90 dias', 'Personalizado'];

  const alternarMenu = (id: string) => {
    setMenuAbertoId(menuAbertoId === id ? null : id);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 px-4">
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="space-y-1 text-center md:text-left">
          <h1 className="text-5xl font-black italic tracking-tighter flex items-center justify-center md:justify-start gap-4 uppercase">
             <History size={48} className="text-primary" /> AUDITORIA
          </h1>
          <p className="text-muted-foreground uppercase text-[10px] font-black tracking-[0.3em] opacity-60">Rastreabilidade temporal de transações (RF10)</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="glass px-6 py-4 rounded-[2rem] border border-primary/20 flex items-center gap-3 hover:bg-surface transition-all"
            >
               <Calendar size={20} className="text-primary" />
               <span className="font-black text-xs uppercase tracking-widest">{filtroPeriodo}</span>
               <ChevronDown size={14} className={mostrarFiltros ? 'rotate-180' : ''} />
            </button>
            <AnimatePresence>
              {mostrarFiltros && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMostrarFiltros(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-3 w-56 glass rounded-2xl border border-white/10 shadow-3xl z-50 overflow-hidden"
                  >
                    {periodos.map(p => (
                      <button
                        key={p}
                        onClick={() => { setFiltroPeriodo(p); setMostrarFiltros(false); }}
                        className={`w-full px-6 py-4 text-left text-xs font-black uppercase tracking-widest border-b border-white/5 transition-colors ${filtroPeriodo === p ? 'bg-primary text-background' : 'hover:bg-white/5 hover:text-primary'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          <button className="glass p-5 rounded-[2rem] hover:text-primary transition-all"><Search size={24} /></button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-[2.4rem] top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary via-primary/20 to-transparent hidden md:block" />

        <div className="space-y-8">
           {logs.map((log, i) => (
             <motion.div 
               key={log.id}
               initial={{ opacity: 0, x: -20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.1 }}
               className="relative grid grid-cols-1 md:grid-cols-[5rem_1fr] gap-6 group"
             >
                <div className="hidden md:flex justify-center pt-2 relative z-10">
                   <div className="w-12 h-12 rounded-full bg-background border-4 border-surface flex items-center justify-center shadow-2xl group-hover:border-primary transition-colors duration-500">
                      <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                   </div>
                </div>

                <div className="glass p-8 rounded-[3.5rem] border border-white/5 hover:bg-white/[0.04] hover:border-primary/20 transition-all shadow-3xl flex flex-col md:flex-row gap-8 items-start md:items-center relative">
                   <div className="flex-shrink-0">
                      {log.icone}
                   </div>

                   <div className="flex-1 space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                         <div className="space-y-1">
                            <span className="text-[10px] font-black italic tracking-widest text-primary uppercase inline-block mb-1">{log.modulo}</span>
                            <h3 className="text-2xl font-black italic tracking-tight uppercase leading-none">{log.acao}</h3>
                         </div>
                         <div className="flex items-center gap-3 text-muted-foreground whitespace-nowrap">
                            <Calendar size={14} />
                            <span className="text-xs font-mono font-bold">{log.data}</span>
                         </div>
                      </div>

                      <p className="text-muted-foreground text-sm font-medium leading-relaxed bg-surface/30 p-4 rounded-2xl border border-border/50">
                        {log.detalhe}
                      </p>

                      <div className="flex items-center gap-4 border-t border-border/30 pt-4">
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-primary">
                              <User size={12} />
                           </div>
                           <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none">Operador:</span>
                           <span className="text-xs font-bold italic text-white leading-none">{log.usuario}</span>
                        </div>
                        <div className="flex items-center gap-2 ml-auto">
                           <Activity size={12} className="text-primary/50" />
                           <span className="text-[10px] font-mono font-black uppercase tracking-widest text-muted-foreground opacity-30">PID-000{log.id}</span>
                        </div>
                      </div>
                   </div>

                   <div className="relative">
                      <button 
                        onClick={() => alternarMenu(log.id)}
                        className="p-4 glass rounded-3xl transition-all hover:bg-surface text-muted-foreground hover:text-primary shadow-xl"
                      >
                         <MoreVertical size={20} />
                      </button>
                      
                      <AnimatePresence>
                        {menuAbertoId === log.id && (
                          <>
                            <div className="fixed inset-0 z-20" onClick={() => setMenuAbertoId(null)} />
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.9, x: 20 }}
                              animate={{ opacity: 1, scale: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.9, x: 20 }}
                              className="absolute right-0 mt-2 w-56 glass rounded-2xl border border-white/10 shadow-3xl z-30 overflow-hidden"
                            >
                               <button className="w-full flex items-center gap-3 px-6 py-4 hover:bg-primary hover:text-primary-foreground transition-all font-black text-[10px] uppercase tracking-widest border-b border-white/5">
                                  <Eye size={16} /> Detalhes Log
                               </button>
                               <button className="w-full flex items-center gap-3 px-6 py-4 hover:bg-primary hover:text-primary-foreground transition-all font-black text-[10px] uppercase tracking-widest border-b border-white/5">
                                  <FileText size={16} /> Gerar PDF
                               </button>
                               <button className="w-full flex items-center gap-3 px-6 py-4 hover:bg-red-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest">
                                  <Trash size={16} /> Excluir log
                               </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                   </div>
                </div>
             </motion.div>
           ))}
        </div>
      </div>

      <div className="pt-10 flex justify-center">
         <button className="bg-surface text-muted-foreground px-12 py-5 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] hover:text-primary transition-all border border-border/50 shadow-2xl">
            Carregar Mais Atividades <ArrowRight size={14} className="inline ml-2" />
         </button>
      </div>
    </div>
  );
}
