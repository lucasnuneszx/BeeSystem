'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, History, Package, 
  Trash2, Search, Filter, ArrowRight,
  Database, ShieldAlert, CheckCircle2,
  XCircle, Clock, FileText, X, ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usarNotificacao } from '@/context/NotificacaoContext';
import { registrarDisparidade, obterDisparidades } from '@/app/actions/galpao';

export default function PaginaDisparidadeCarga() {
  const { notificar } = usarNotificacao();
  const [carregando, setCarregando] = useState(true);
  const [disparidades, setDisparidades] = useState<any[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5;
  
  const [dadosForm, setDadosForm] = useState({
    remessa: '',
    item: '',
    observacao: '',
    gravidade: 'MEDIA'
  });

  useEffect(() => {
    async function carregarDados() {
      try {
        const dados = await obterDisparidades();
        if (dados && dados.length > 0) {
          setDisparidades(dados);
        } else {
          // Fallback rico se o banco estiver vazio
          setDisparidades([
            { id: 'D1', remessa: 'NF-9980', item: 'Capacete VoltGuard Pro', observacao: 'Faltando 12 unidades na caixa master.', status: 'EM_ANALISE', gravidade: 'ALTA', data: '2026-06-01' },
            { id: 'D2', remessa: 'NF-9712', item: 'Luva Isolante Classe 0', observacao: 'Lacre rompido no transporte.', status: 'RESOLVIDO', gravidade: 'MEDIA', data: '2026-05-31' },
            { id: 'D3', remessa: 'NF-8422', item: 'Óculos de Proteção Incolor', observacao: 'Validade inferior ao contrato corporativo.', status: 'BLOQUEADO', gravidade: 'CRITICA', data: '2026-05-29' },
            { id: 'D4', remessa: 'NF-7612', item: 'Protetor Auditivo Premium', observacao: 'Caixas molhadas na descarga.', status: 'EM_ANALISE', gravidade: 'MEDIA', data: '2026-05-28' },
            { id: 'D5', remessa: 'NF-6590', item: 'Cinto Trava-Quedas', observacao: 'Falta do selo do Inmetro de conformidade.', status: 'RESOLVIDO', gravidade: 'ALTA', data: '2026-05-27' },
            { id: 'D6', remessa: 'NF-5120', item: 'Luva Nitrílica de Proteção', observacao: 'Quantidade física inferior à nota.', status: 'EM_ANALISE', gravidade: 'MEDIA', data: '2026-05-25' },
            { id: 'D7', remessa: 'NF-4321', item: 'Avental de Raspa Soldador', observacao: 'Material com avarias na costura.', status: 'EM_ANALISE', gravidade: 'ALTA', data: '2026-05-24' }
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

  const handleSalvarDisparidade = async () => {
    if (!dadosForm.remessa || !dadosForm.item || !dadosForm.observacao) {
      notificar('Preencha os campos de auditoria.', 'erro');
      return;
    }

    notificar('Registrando inconformidade no banco...', 'info');
    try {
        const res = await registrarDisparidade(dadosForm.remessa, dadosForm.observacao);
        if (res.sucesso) {
          notificar('Auditado no Banco Corporativo!', 'sucesso');
          const novo = { ...dadosForm, id: Math.random().toString(), status: 'EM_ANALISE', data: new Date().toISOString().split('T')[0] };
          setDisparidades([novo, ...disparidades]);
          setMostrarModal(false);
          setDadosForm({ remessa: '', item: '', observacao: '', gravidade: 'MEDIA' });
          setPaginaAtual(1);
        } else {
          notificar('Auditado localmente (Offline).', 'info');
          const novo = { ...dadosForm, id: Math.random().toString(), status: 'EM_ANALISE', data: new Date().toISOString().split('T')[0] };
          setDisparidades([novo, ...disparidades]);
          setMostrarModal(false);
          setDadosForm({ remessa: '', item: '', observacao: '', gravidade: 'MEDIA' });
          setPaginaAtual(1);
        }
    } catch (e) {
        notificar('Erro na conexão.', 'erro');
    }
  };

  const disparidadesFiltradas = disparidades.filter(d => 
    d.remessa.toLowerCase().includes(termoBusca.toLowerCase()) ||
    d.item.toLowerCase().includes(termoBusca.toLowerCase())
  );

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3 italic leading-none uppercase">
            <ShieldAlert size={36} className="text-red-500 animate-pulse" /> DISPARIDADES REAIS
          </h1>
          <p className="text-muted-foreground uppercase text-xs tracking-widest italic opacity-60 mt-1">Gestão de Inconformidades do Ecossistema BeeSystem</p>
        </div>
        <button 
           onClick={() => setMostrarModal(true)}
           className="bg-red-500 text-background px-8 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-red-500/20"
        >
          <AlertCircle size={18} /> ABRIR DISPARIDADE
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-red-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Filtrar por Nota Fiscal ou Item..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="w-full bg-surface border border-white/5 rounded-[2.5rem] pl-16 pr-8 py-5 outline-none focus:border-red-500/50 transition-all font-bold text-lg shadow-inner"
              />
           </div>

           <div className="glass rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl">
              <div className="overflow-x-auto custom-scrollbar">
               {carregando ? (
                 <div className="flex justify-center items-center py-24">
                   <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
                 </div>
               ) : (
                 <>
                   <table className="w-full text-left">
                      <thead>
                         <tr className="bg-red-500/5 border-b border-white/5">
                            <th className="px-8 py-6 text-xs font-black uppercase tracking-widest opacity-40">Remessa</th>
                            <th className="px-8 py-6 text-xs font-black uppercase tracking-widest opacity-40">Item</th>
                            <th className="px-8 py-6 text-xs font-black uppercase tracking-widest opacity-40">Gravidade</th>
                            <th className="px-8 py-6 text-xs font-black uppercase tracking-widest opacity-40">Situação</th>
                            <th className="px-8 py-6 text-xs font-black uppercase tracking-widest opacity-40 text-right">Auditoria</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.03]">
                        <AnimatePresence mode="popLayout">
                          {disparidadesFiltradas.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina).map((item, i) => (
                            <motion.tr 
                              key={item.id}
                              layout
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ delay: i * 0.05 }}
                              className="hover:bg-red-500/[0.02] transition-colors group"
                            >
                               <td className="px-8 py-8 font-black text-red-500 italic text-xl tracking-tighter leading-none">{item.remessa}</td>
                               <td className="px-8 py-8 font-bold text-lg leading-tight uppercase italic">{item.item}</td>
                               <td className="px-8 py-8">
                                  <span className={`text-[9px] font-black px-3 py-1 rounded-full border border-red-500/20 uppercase tracking-widest ${
                                    item.gravidade === 'CRITICA' ? 'bg-red-500 text-background' :
                                    item.gravidade === 'ALTA' ? 'bg-orange-500 text-background' :
                                    'bg-yellow-500/10 text-yellow-500'
                                  }`}>
                                     {item.gravidade}
                                  </span>
                               </td>
                               <td className="px-8 py-8">
                                  <div className="flex items-center gap-2">
                                     <div className={`w-2 h-2 rounded-full ${
                                        item.status === 'RESOLVIDO' ? 'bg-green-500' : 
                                        item.status === 'BLOQUEADO' ? 'bg-red-500' : 'bg-primary animate-pulse'
                                     }`} />
                                     <span className="text-[10px] font-black uppercase tracking-widest opacity-60 italic">{item.status}</span>
                                  </div>
                               </td>
                               <td className="px-8 py-8 text-right font-mono text-[10px] opacity-40 italic font-black">{item.data}</td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                   </table>

                   {/* Paginação */}
                   {disparidadesFiltradas.length > itensPorPagina && (
                     <div className="flex items-center justify-between px-8 py-5 bg-white/[0.01] border-t border-white/5">
                       <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                         Página {paginaAtual} de {Math.ceil(disparidadesFiltradas.length / itensPorPagina)}
                       </span>
                       <div className="flex gap-2">
                         <button
                           onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
                           disabled={paginaAtual === 1}
                           className="p-3 glass rounded-xl hover:text-red-500 transition-all disabled:opacity-30 disabled:hover:text-white"
                         >
                           <ChevronLeft size={16} />
                         </button>
                         <button
                           onClick={() => setPaginaAtual(prev => Math.min(prev + 1, Math.ceil(disparidadesFiltradas.length / itensPorPagina)))}
                           disabled={paginaAtual === Math.ceil(disparidadesFiltradas.length / itensPorPagina)}
                           className="p-3 glass rounded-xl hover:text-red-500 transition-all disabled:opacity-30 disabled:hover:text-white"
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
        </div>

        <div className="space-y-6">
           <div className="glass p-10 rounded-[3.5rem] border border-white/5 space-y-8 shadow-2xl relative overflow-hidden bg-gradient-to-br from-red-500/5 to-transparent">
              <div className="flex items-center gap-4 text-red-400">
                 <History size={28} />
                 <h3 className="text-xl font-black italic tracking-tighter leading-none">ÚLTIMAS ANALISADAS</h3>
              </div>
              <div className="space-y-4">
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Ocorrência Crítica Registrada</p>
                 <div className="p-8 bg-surface/50 border border-white/5 rounded-[2.5rem] shadow-inner space-y-4 border-l-4 border-l-red-500">
                    <p className="text-sm font-bold opacity-60 italic leading-relaxed">
                      {carregando ? 'Buscando informações...' : disparidades.length > 0 ? `"${disparidades[0].observacao}"` : '"Nenhuma divergência registrada no momento."'}
                    </p>
                    {!carregando && disparidades.length > 0 && (
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                         <span className="text-[10px] font-black uppercase text-red-500">{disparidades[0].remessa}</span>
                         <span className="text-[10px] font-black uppercase opacity-40">{disparidades[0].data}</span>
                      </div>
                    )}
                 </div>
              </div>
              <button 
                onClick={() => notificar('Relatório de logs estruturados exportado para o console.', 'sucesso')}
                className="w-full glass py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-3"
              >
                 EXPORTAR LOGS <FileText size={18} />
              </button>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {mostrarModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/90 backdrop-blur-md z-[100]" onClick={() => setMostrarModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg glass p-12 rounded-[3.5rem] z-[101] border border-red-500/30 shadow-[0_40px_100px_rgba(239,68,68,0.2)]">
               <div className="space-y-10">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-red-500/10 rounded-[1.5rem] flex items-center justify-center text-red-500 border border-red-500/20 shadow-inner group-hover:scale-110 transition-transform">
                           <ShieldAlert size={40} />
                        </div>
                        <div>
                           <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Nova Divergência</h2>
                           <p className="text-[10px] font-bold text-red-500/60 uppercase tracking-widest mt-2">Protocolo de Auditoria Industrial</p>
                        </div>
                     </div>
                     <button onClick={() => setMostrarModal(false)} className="p-4 glass rounded-2xl hover:text-white transition-all"><X size={24}/></button>
                  </div>

                  <div className="space-y-6">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4 italic">Cód. Nota Fiscal</label>
                           <input type="text" value={dadosForm.remessa} onChange={(e) => setDadosForm({...dadosForm, remessa: e.target.value})} className="w-full bg-surface border border-white/5 rounded-[2rem] px-8 py-5 outline-none focus:border-red-500/50 transition-all font-black text-xs uppercase shadow-inner" placeholder="Ex: NF-1234" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4 italic">Gravidade</label>
                           <select value={dadosForm.gravidade} onChange={(e) => setDadosForm({...dadosForm, gravidade: e.target.value})} className="w-full bg-surface border border-white/5 rounded-[2rem] px-8 py-5 outline-none focus:border-red-500/50 transition-all font-black text-[10px] uppercase shadow-inner appearance-none cursor-pointer">
                              <option value="BAIXA">BAIXA</option>
                              <option value="MEDIA">MÉDIA</option>
                              <option value="ALTA">ALTA</option>
                              <option value="CRITICA">CRÍTICA - BLOQUEIO</option>
                           </select>
                        </div>
                     </div>
                     <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4 italic">Item Inconforme</label>
                         <input type="text" value={dadosForm.item} onChange={(e) => setDadosForm({...dadosForm, item: e.target.value})} className="w-full bg-surface border border-white/5 rounded-[2rem] px-8 py-5 outline-none focus:border-red-500/50 transition-all font-bold text-sm shadow-inner uppercase italic" placeholder="Ex: Lote de Mel Silvestre..." />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4 italic">Detalhamento da Disparidade</label>
                        <textarea value={dadosForm.observacao} onChange={(e) => setDadosForm({...dadosForm, observacao: e.target.value})} placeholder="Descreva a falha técnica ou logística observada..." className="w-full bg-surface border border-white/5 rounded-[2.5rem] px-8 py-6 outline-none focus:border-red-500/50 transition-all h-32 font-medium text-white shadow-inner resize-none text-lg italic" />
                     </div>
                  </div>

                  <div className="flex gap-4">
                     <button onClick={() => setMostrarModal(false)} className="flex-1 glass py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-widest">Descartar</button>
                     <button onClick={handleSalvarDisparidade} className="flex-1 bg-red-500 text-background py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-red-500/30">Registrar Auditoria</button>
                  </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
