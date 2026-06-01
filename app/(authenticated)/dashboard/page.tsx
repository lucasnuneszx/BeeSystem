'use client';

import React, { useState, useEffect } from 'react';
import { usarAutenticacao } from '@/context/AuthContext';
import {
  TrendingUp, AlertTriangle, Package, Users,
  ShoppingCart, CheckCircle, Clock, XCircle, Calendar,
  ChevronDown, Layout, AlertCircle, RefreshCw
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area,
  PieChart, Pie, Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { obterMetricasDashboard } from '@/app/actions/dashboard';
import { usarNotificacao } from '@/context/NotificacaoContext';

const diffDias = (d1: Date, d2: Date) => Math.floor((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));

const CardEstatistica = ({ rotulo, valor, icone: Icone, tendencia, cor, corTexto, sub }: any) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="glass p-8 rounded-[2.5rem] flex items-center justify-between group border border-white/5 shadow-2xl"
  >
    <div className="space-y-2">
      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-50 px-1">{rotulo}</p>
      <h3 className="text-4xl font-black italic tracking-tighter leading-none">{valor}</h3>
      {tendencia !== undefined && (
        <div className={`text-[10px] font-black uppercase tracking-widest mt-1 ${tendencia > 0 ? 'text-green-500' : tendencia < 0 ? 'text-red-500' : 'text-muted-foreground'} flex items-center gap-1`}>
          {tendencia > 0 ? '▲' : tendencia < 0 ? '▼' : '—'} {sub}
        </div>
      )}
      {sub && tendencia === undefined && <p className="text-[10px] opacity-40 uppercase tracking-widest">{sub}</p>}
    </div>
    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center ${cor} bg-opacity-20 transition-all duration-500 group-hover:scale-110 shadow-inner border border-white/5`}>
      <Icone size={28} className={corTexto} />
    </div>
  </motion.div>
);

export default function PaginaDashboard() {
  const { usuario } = usarAutenticacao();
  const { notificar } = usarNotificacao();
  const perfil = usuario?.perfil;
  const [carregando, setCarregando] = useState(false);
  const [metricas, setMetricas] = useState<any>(null);
  const [filtroPeriodo, setFiltroPeriodo] = useState('7 dias');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const carregarMetricas = async () => {
    setCarregando(true);
    try {
      const res = await obterMetricasDashboard();
      setMetricas(res);
    } catch (e) {
      console.error('Erro ao carregar métricas:', e);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { carregarMetricas(); }, []);

  const periodos = ['7 dias', '15 dias', '30 dias', '60 dias', '90 dias'];

  const statusData = metricas ? [
    { name: 'Aprovados', value: metricas.aprovados, color: '#22c55e' },
    { name: 'Pendentes', value: metricas.pendentes, color: '#FACC15' },
    { name: 'Rejeitados', value: metricas.rejeitados, color: '#ef4444' },
  ] : [];

  const today = new Date();
  const todosAlertas = [
    ...(metricas?.alertasVencidos || []),
    ...(metricas?.alertasProximos || [])
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="space-y-1 flex items-center gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase leading-none italic">PAINEL DE CONTROLE</h1>
            <p className="text-muted-foreground text-xs uppercase tracking-widest opacity-60 italic mt-1">
              VoltGuard · BeeSystem · {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
            </p>
          </div>

          <div className="relative">
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="glass px-6 py-4 rounded-[2rem] border border-primary/20 flex items-center gap-3 hover:bg-surface transition-all active:scale-95"
            >
              <Calendar size={20} className="text-primary" />
              <span className="font-black text-xs uppercase tracking-widest">{filtroPeriodo}</span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${mostrarFiltros ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {mostrarFiltros && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMostrarFiltros(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-3 w-48 glass rounded-2xl border border-white/10 shadow-3xl z-50 overflow-hidden"
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

        <div className="flex gap-4">
          <button
            onClick={carregarMetricas}
            className="glass p-4 rounded-xl hover:text-primary transition-all"
            title="Atualizar"
          >
            <RefreshCw size={20} className={carregando ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {carregando ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-40 skeleton rounded-[2.5rem]" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardEstatistica rotulo="Total de Pedidos" valor={metricas?.totalPedidos ?? 0} icone={ShoppingCart} cor="bg-primary/20" corTexto="text-primary" />
          <CardEstatistica rotulo="Pedidos Pendentes" valor={metricas?.pendentes ?? 0} icone={Clock} cor="bg-yellow-500/20" corTexto="text-yellow-400" sub="Aguardando aprovação" />
          <CardEstatistica rotulo="Lotes Vencidos" valor={metricas?.lotesVencidos ?? 0} icone={AlertTriangle} cor="bg-red-500/20" corTexto="text-red-500" sub="Bloqueados (RN01)" />
          <CardEstatistica rotulo="Itens em Estoque" valor={(metricas?.estoqueTotal ?? 0).toLocaleString()} icone={Package} cor="bg-blue-500/20" corTexto="text-blue-400" />
        </div>
      )}

      {!carregando && metricas && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass p-8 rounded-[2.5rem] border border-green-500/20 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Aprovados</p>
              <h3 className="text-4xl font-black italic text-green-500">{metricas.aprovados}</h3>
            </div>
            <CheckCircle size={36} className="text-green-500 opacity-30" />
          </div>
          <div className="glass p-8 rounded-[2.5rem] border border-red-500/20 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Rejeitados</p>
              <h3 className="text-4xl font-black italic text-red-500">{metricas.rejeitados}</h3>
            </div>
            <XCircle size={36} className="text-red-500 opacity-30" />
          </div>
          <div className="glass p-8 rounded-[2.5rem] border border-orange-500/20 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Próx. Vencimento</p>
              <h3 className="text-4xl font-black italic text-orange-400">{metricas.lotesProximos}</h3>
              <p className="text-[10px] opacity-40 uppercase tracking-widest">Dentro de 30 dias</p>
            </div>
            <AlertCircle size={36} className="text-orange-500 opacity-30" />
          </div>
        </div>
      )}

      {statusData.length > 0 && metricas?.totalPedidos > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass p-10 rounded-[3rem] space-y-8 border border-white/5">
            <div>
              <h3 className="text-2xl font-black italic tracking-tighter leading-none">DISTRIBUIÇÃO DE PEDIDOS</h3>
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-50 mt-1">Por status operacional</p>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} barSize={48}>
                  <CartesianGrid strokeDasharray="5 5" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#4b5563" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} />
                  <YAxis stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#0a0a0b', border: '1px solid #ffffff10', borderRadius: '24px', padding: '16px' }} />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass p-10 rounded-[3rem] border border-white/5 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-black italic tracking-tighter">STATUS GLOBAL</h3>
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-50 mt-1">Performance funcional</p>
            </div>
            <div className="h-[220px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={6} dataKey="value" stroke="none">
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0a0a0b', border: '1px solid #ffffff10', borderRadius: '24px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-4xl font-black leading-none italic">{metricas?.totalPedidos ?? 0}</p>
                  <p className="text-[8px] text-muted-foreground uppercase font-black tracking-[0.3em] mt-1">Total</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {statusData.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                    <span className="text-muted-foreground">{s.name}</span>
                  </div>
                  <span className="text-white">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {todosAlertas.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-black italic tracking-tighter flex items-center gap-3">
            <AlertTriangle className="text-red-500 animate-pulse" /> ALERTAS CRÍTICOS DE VALIDADE
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {todosAlertas.slice(0, 6).map((alerta: any, i: number) => {
              const dias = diffDias(new Date(alerta.validade), today);
              const vencido = dias < 0;
              return (
                <motion.div
                  key={alerta.id}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className={`p-8 rounded-[2.5rem] border flex flex-col gap-5 shadow-2xl ${vencido ? 'bg-red-500/5 border-red-500/20' : dias <= 5 ? 'bg-orange-500/5 border-orange-500/20' : 'bg-yellow-500/5 border-yellow-500/20'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] uppercase font-black px-4 py-1.5 rounded-xl ${vencido ? 'bg-red-500 text-background' : dias <= 5 ? 'bg-orange-500 text-background' : 'bg-yellow-500 text-background'}`}>
                      {vencido ? `VENCIDO há ${Math.abs(dias)} dias` : `Vence em ${dias} dia${dias !== 1 ? 's' : ''}`}
                    </span>
                    <Clock size={20} className="text-muted-foreground opacity-30" />
                  </div>
                  <div>
                    <h4 className="font-black text-xl italic leading-none">{alerta.produto}</h4>
                    <p className="text-[10px] text-muted-foreground border-l-2 border-primary ml-1 pl-3 mt-3 uppercase font-black tracking-widest">
                      Lote: {alerta.lote} · {alerta.quantidade} un.
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
