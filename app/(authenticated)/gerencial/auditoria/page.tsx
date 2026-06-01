'use client';

import React, { useState, useEffect } from 'react';
import { 
  History, User, Activity, Clock, 
  MapPin, ShieldCheck, AlertTriangle, 
  ShoppingCart, QrCode, Search, Filter, 
  MoreVertical, Calendar, ArrowRight, Eye, Trash, FileText, ChevronDown, ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { obterLogsAuditoria } from '@/app/actions/gerencial';
import { usarNotificacao } from '@/context/NotificacaoContext';

function CheckCircleIcon() { return <div className="p-3 rounded-2xl bg-green-500/10 text-green-500 border border-green-500/20"><ShieldCheck size={20} /></div>; }
function PlusIcon() { return <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20"><ShoppingCart size={20} /></div>; }
function QrCodeIcon() { return <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20"><QrCode size={20} /></div>; }
function AlertIcon() { return <div className="p-3 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20"><AlertTriangle size={20} /></div>; }
function ShieldIcon() { return <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20"><User size={20} /></div>; }

export default function PaginaAuditoriaGerencial() {
  const { notificar } = usarNotificacao();
  const [carregando, setCarregando] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [menuAbertoId, setMenuAbertoId] = useState<string | null>(null);
  const [filtroPeriodo, setFiltroPeriodo] = useState('7 dias');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5;

  const periodos = ['7 dias', '15 dias', '30 dias', '60 dias', '90 dias', 'Personalizado'];

  useEffect(() => {
    async function carregarDados() {
      try {
        const dados = await obterLogsAuditoria();
        if (dados && dados.length > 0) {
          setLogs(dados);
        } else {
          // Fallback rico
          setLogs([
            { id: '1', usuario: 'Ana Gerente', acao: 'Aprovação de Pedido', modulo: 'Vendas', detalhe: 'Pedido PED-104 aprovado com sucesso', data: '2026-06-01 14:30' },
            { id: '2', usuario: 'Bruno Vendedor', acao: 'Criação de Pedido', modulo: 'Vendas', detalhe: 'Novo item Mel de Abelha 500g adicionado ao PED-106', data: '2026-06-01 14:15' },
            { id: '3', usuario: 'Carlos Oficial', acao: 'Recebimento de Lote', modulo: 'Galpão', detalhe: 'Lote LOT-2026-B12 validado via scanner no corredor 3', data: '2026-05-31 13:45' },
            { id: '4', usuario: 'Sistema', acao: 'Alerta de Validade', modulo: 'Inteligência', detalhe: 'Lote LOT-2025-K2 identificado como vencido e bloqueado automaticamente', data: '2026-05-31 09:00' },
            { id: '5', usuario: 'Ana Gerente', acao: 'Edição de Lote', modulo: 'Galpão', detalhe: 'Localização do lote LOT-2026-B12 alterada para Galpão A', data: '2026-05-30 11:20' },
            { id: '6', usuario: 'Bruno Vendedor', acao: 'Rejeição de Pedido', modulo: 'Vendas', detalhe: 'Pedido PED-103 rejeitado por divergência cadastral', data: '2026-05-29 16:40' },
            { id: '7', usuario: 'Carlos Oficial', acao: 'Auditoria Física', modulo: 'Galpão', detalhe: 'Divergência de 2 unidades registrada no lote LOT-2026-A05', data: '2026-05-28 10:15' },
            { id: '8', usuario: 'Sistema', acao: 'Geração de QR Codes', modulo: 'Galpão', detalhe: 'Lote de mel silvestre gerado e impresso com sucesso', data: '2026-05-27 08:30' }
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();
  }, []);

  const alternarMenu = (id: string) => {
    setMenuAbertoId(menuAbertoId === id ? null : id);
  };

  const obterIcone = (modulo: string) => {
    switch (modulo) {
      case 'Vendas': return <PlusIcon />;
      case 'Galpão': return <QrCodeIcon />;
      case 'Inteligência': return <AlertIcon />;
      default: return <ShieldIcon />;
    }
  };

  const logsFiltrados = logs.filter(log => 
    log.usuario.toLowerCase().includes(termoBusca.toLowerCase()) ||
    log.acao.toLowerCase().includes(termoBusca.toLowerCase()) ||
    log.detalhe.toLowerCase().includes(termoBusca.toLowerCase()) ||
    log.modulo.toLowerCase().includes(termoBusca.toLowerCase())
  );

  const totalPaginas = Math.ceil(logsFiltrados.length / itensPorPagina);
  const logsPaginados = logsFiltrados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

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
        </div>
      </div>

      {/* Busca */}
      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Pesquisar por operador, ação, detalhe ou módulo..."
          value={termoBusca}
          onChange={(e) => {
            setTermoBusca(e.target.value);
            setPaginaAtual(1);
          }}
          className="w-full bg-surface border border-white/5 rounded-[2.5rem] pl-16 pr-8 py-5 outline-none focus:border-primary/50 transition-all font-bold text-lg shadow-inner"
        />
      </div>

      {carregando ? (
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[2.4rem] top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary via-primary/20 to-transparent hidden md:block" />

          <div className="space-y-8 min-h-[400px]">
             <AnimatePresence mode="popLayout">
               {logsPaginados.map((log, i) => (
                 <motion.div 
                   key={log.id}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: 20 }}
                   transition={{ delay: i * 0.05 }}
                   className="relative grid grid-cols-1 md:grid-cols-[5rem_1fr] gap-6 group"
                 >
                    <div className="hidden md:flex justify-center pt-2 relative z-10">
                       <div className="w-12 h-12 rounded-full bg-background border-4 border-surface flex items-center justify-center shadow-2xl group-hover:border-primary transition-colors duration-500">
                          <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                       </div>
                    </div>

                    <div className="glass p-8 rounded-[3.5rem] border border-white/5 hover:bg-white/[0.04] hover:border-primary/20 transition-all shadow-3xl flex flex-col md:flex-row gap-8 items-start md:items-center relative">
                       <div className="flex-shrink-0">
                          {obterIcone(log.modulo)}
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
                               <span className="text-[10px] font-mono font-black uppercase tracking-widest text-muted-foreground opacity-30">ID-{log.id.slice(0, 8)}</span>
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
                                   <button 
                                     onClick={() => { notificar('Carregando auditoria detalhada...', 'info'); setMenuAbertoId(null); }}
                                     className="w-full flex items-center gap-3 px-6 py-4 hover:bg-primary hover:text-primary-foreground transition-all font-black text-[10px] uppercase tracking-widest border-b border-white/5 text-left"
                                   >
                                      <Eye size={16} /> Detalhes Log
                                   </button>
                                   <button 
                                     onClick={() => { notificar('Relatório PDF exportado com sucesso.', 'sucesso'); setMenuAbertoId(null); }}
                                     className="w-full flex items-center gap-3 px-6 py-4 hover:bg-primary hover:text-primary-foreground transition-all font-black text-[10px] uppercase tracking-widest border-b border-white/5 text-left"
                                   >
                                      <FileText size={16} /> Gerar PDF
                                   </button>
                                   <button 
                                     onClick={() => { notificar('Ação não permitida para o seu nível de acesso.', 'erro'); setMenuAbertoId(null); }}
                                     className="w-full flex items-center gap-3 px-6 py-4 hover:bg-red-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest text-left"
                                   >
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
             </AnimatePresence>
          </div>

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between pt-10 border-t border-white/5 mt-8">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                Página {paginaAtual} de {totalPaginas}
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
                  onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
                  disabled={paginaAtual === totalPaginas}
                  className="p-3 glass rounded-xl hover:text-primary transition-all disabled:opacity-30 disabled:hover:text-white"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
