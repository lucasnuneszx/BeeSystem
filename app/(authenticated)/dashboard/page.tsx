'use client';

import React, { useState, useEffect } from 'react';
import { usarAutenticacao } from '@/context/AuthContext';
import { usarNotificacao } from '@/context/NotificacaoContext';
import { 
  TrendingUp, AlertTriangle, Package, Users, 
  ShoppingCart, CheckCircle, Clock, XCircle, Calendar, ChevronDown, Layout, Database
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area,
  PieChart, Pie, Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { exportarRelatorioDashboard } from '@/utils/exportar';
import { obterMetricasDashboard } from '@/app/actions/dashboard';
import { popularBancoDeDados } from '@/app/actions/seed';

// Dados Iniciais Re-populados (RF População Imediata)
const gerarDadosPorPeriodos = (periodo: string) => {
  const multiplicador = periodo === '7 dias' ? 1 : periodo === '15 dias' ? 2 : periodo === '30 dias' ? 4 : periodo === '60 dias' ? 8 : 12;
  
  return {
    semana: [
      { nome: 'Segunda', pedidos: 400 * multiplicador / 4, vendas: 2400 * multiplicador / 4 },
      { nome: 'Terça', pedidos: 300 * multiplicador / 4, vendas: 1398 * multiplicador / 4 },
      { nome: 'Quarta', pedidos: 200 * multiplicador / 4, vendas: 9800 * multiplicador / 4 },
      { nome: 'Quinta', pedidos: 278 * multiplicador / 4, vendas: 3908 * multiplicador / 4 },
      { nome: 'Sexta', pedidos: 189 * multiplicador / 4, vendas: 4800 * multiplicador / 4 },
      { nome: 'Sábado', pedidos: 239 * multiplicador / 4, vendas: 3800 * multiplicador / 4 },
    ],
    metricas: {
      pedidos: (1280 * multiplicador).toLocaleString(),
      estoque: (15420).toLocaleString(),
      alertas: Math.floor(14 * (multiplicador / 2)),
      clientes: (342 + (multiplicador * 10)).toLocaleString()
    },
    status: [
      { name: 'Aprovados', value: 400 * multiplicador, color: '#f59e0b' },
      { name: 'Pendentes', value: 300 * multiplicador, color: '#4b5563' },
      { name: 'Rejeitados', value: 100 * multiplicador, color: '#ef4444' },
    ]
  };
};

const CardEstatistica = ({ rotulo, valor, icone: Icone, tendencia, cor, corTexto }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass p-8 rounded-[2.5rem] flex items-center justify-between group border border-white/5 shadow-2xl"
  >
    <div className="space-y-2">
      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-50 px-1">{rotulo}</p>
      <h3 className="text-4xl font-black italic tracking-tighter leading-none">{valor}</h3>
      {tendencia && (
        <div className={`text-[10px] font-black uppercase tracking-widest mt-1 ${tendencia > 0 ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
          {tendencia > 0 ? '▲' : '▼'} {Math.abs(tendencia)}% <span className="opacity-40 italic">histórico</span>
        </div>
      )}
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
  const [filtroPeriodo, setFiltroPeriodo] = useState('7 dias');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [dadosAtuais, setDadosAtuais] = useState(gerarDadosPorPeriodos('7 dias'));
  const [exportando, setExportando] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    setDadosAtuais(gerarDadosPorPeriodos(filtroPeriodo));
  }, [filtroPeriodo]);

  const handleSeed = async () => {
    setSeeding(true);
    notificar('Sincronizando Colmeia com Banco Logístico...', 'info');
    try {
        const res = await popularBancoDeDados();
        if (res.sucesso) {
          notificar('Dados persistidos com sucesso!', 'sucesso');
        } else {
          notificar('Persistência falhou: ' + (res.erro || 'Erro no Prisma'), 'erro');
        }
    } catch (e) {
        notificar('Erro técnico na conexão.', 'erro');
    }
    setSeeding(false);
  };

  const handleExportarExcel = () => {
    setExportando(true);
    setTimeout(() => {
        const resumo = {
            'Total Pedidos': dadosAtuais.metricas.pedidos,
            'Estoque Total': dadosAtuais.metricas.estoque,
            'Alertas Validade': dadosAtuais.metricas.alertas,
            'Clientes Ativos': dadosAtuais.metricas.clientes,
            'Ciclo Analisado': filtroPeriodo,
            'Geração': new Date().toLocaleString()
        };
        const dadosAlertas = [
            { Item: 'Mel de Abelha 500g', Lote: 'LOT-X1', Status: 'Urgente', Vencimento: '2 dias' },
            { Item: 'Própolis 30ml', Lote: 'LOT-M4', Status: 'Aviso', Vencimento: '15 dias' },
            { Item: 'Geleia Real 20g', Lote: 'LOT-K2', Status: 'Vencido', Vencimento: '-1 dia' },
        ];
        exportarRelatorioDashboard(resumo, dadosAtuais.semana, dadosAlertas);
        setExportando(false);
    }, 1200);
  };

  const periodos = ['7 dias', '15 dias', '30 dias', '60 dias', '90 dias', 'Personalizado'];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="space-y-1 flex items-center gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase leading-none italic">PAINEL DE CONTROLE</h1>
            <p className="text-muted-foreground text-xs uppercase tracking-widest opacity-60 italic">Sincronizado com Ecossistema BeeSystem</p>
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
                    className="absolute top-full left-0 mt-3 w-56 glass rounded-2xl border border-white/10 shadow-3xl z-50 overflow-hidden"
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
              onClick={handleSeed}
              disabled={seeding}
              className="glass px-6 py-4 rounded-[2rem] border border-primary/20 text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-primary hover:text-background transition-all"
            >
              <Database size={18} className={seeding ? 'animate-spin' : ''} /> 
              Sincronizar Banco
            </button>
            {perfil === 'GERENTE' && (
               <button 
                 onClick={handleExportarExcel}
                 disabled={exportando}
                 className="glass px-8 py-4 rounded-[2rem] border border-blue-500/40 text-blue-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-blue-500 hover:text-white transition-all shadow-2xl"
               >
                 <Layout size={18} className={exportando ? 'animate-spin' : ''} /> 
                 Relatório XLSX
               </button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CardEstatistica rotulo="Pedidos no Ciclo" valor={dadosAtuais.metricas.pedidos} icone={ShoppingCart} tendencia={12} cor="bg-primary/20" corTexto="text-primary" />
        <CardEstatistica rotulo="Itens em Estoque" valor={dadosAtuais.metricas.estoque} icone={Package} tendencia={0} cor="bg-blue-500/20" corTexto="text-blue-400" />
        <CardEstatistica rotulo="Alertas Validade" valor={dadosAtuais.metricas.alertas} icone={AlertTriangle} cor="bg-red-500/20" corTexto="text-red-500" />
        <CardEstatistica rotulo="Clientes Novos" valor={dadosAtuais.metricas.clientes} icone={Users} tendencia={5} cor="bg-purple-500/20" corTexto="text-purple-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass p-10 rounded-[3rem] space-y-8 relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <div>
               <h3 className="text-2xl font-black italic tracking-tighter leading-none">FLUXO DE VENDAS</h3>
               <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-50 mt-1">Distribuição financeira do ciclo ({filtroPeriodo})</p>
            </div>
            <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest">
              <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary" /> Receita (BRL)</span>
              <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /> Volume Pedidos</span>
            </div>
          </div>
          <div className="h-[350px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dadosAtuais.semana}>
                <defs>
                  <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="5 5" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="nome" stroke="#4b5563" fontSize={10} fontStyle="italic" fontWeight="bold" tickLine={false} axisLine={false} />
                <YAxis stroke="#4b5563" fontSize={10} fontStyle="italic" fontWeight="bold" tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0b', border: '1px solid #ffffff10', borderRadius: '24px', padding: '20px' }}
                  itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                />
                <Area type="monotone" dataKey="vendas" stroke="#f59e0b" strokeWidth={4} fillOpacity={1} fill="url(#colorVendas)" />
                <Area type="monotone" dataKey="pedidos" stroke="#3b82f6" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-10 rounded-[3rem] space-y-8 flex flex-col justify-between">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-black italic tracking-tighter">STATUS GLOBAL</h3>
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-50 mt-1">Performance funcional do período</p>
            </div>
            <div className="h-[280px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosAtuais.status}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {dadosAtuais.status.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0b', border: '1px solid #ffffff10', borderRadius: '24px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="text-center">
                    <p className="text-4xl font-black leading-none italic">{800 * (filtroPeriodo === '7 dias' ? 1 : 4)}</p>
                    <p className="text-[8px] text-muted-foreground uppercase font-black tracking-[0.3em] mt-1">Eventos</p>
                 </div>
              </div>
            </div>
            <div className="space-y-3">
              {dadosAtuais.status.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                   <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ background: s.color }} />
                      <span className="text-muted-foreground">{s.name}</span>
                   </div>
                   <span className="text-white">{s.value}</span>
                </div>
              ))}
            </div>
        </div>
      </div>

      <div className="space-y-6">
         <h2 className="text-2xl font-black italic tracking-tighter flex items-center gap-3">
           <AlertTriangle className="text-red-500 animate-pulse" /> ALERTAS CRÍTICOS NO CICLO
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { item: 'Mel de Abelha 500g', lot: 'LOT-2024-X1', status: 'urgente' },
              { item: 'Própolis 30ml', lot: 'LOT-2024-M4', status: 'aviso' },
              { item: 'Geleia Real 20g', lot: 'LOT-2023-K2', status: 'vencido' },
            ].map((alerta, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.02, y: -5 }}
                className={`p-8 rounded-[2.5rem] border flex flex-col gap-5 transition-all shadow-2xl ${
                  alerta.status === 'vencido' ? 'bg-red-500/5 border-red-500/20' :
                  alerta.status === 'urgente' ? 'bg-orange-500/5 border-orange-500/20' :
                  'bg-yellow-500/5 border-yellow-500/20'
                }`}
              >
                 <div className="flex items-center justify-between">
                    <span className={`text-[10px] uppercase font-black px-4 py-1.5 rounded-xl ${
                       alerta.status === 'vencido' ? 'bg-red-500 text-background' :
                       alerta.status === 'urgente' ? 'bg-orange-500 text-background' :
                       'bg-yellow-500 text-background'
                    }`}>
                      {alerta.status === 'vencido' ? 'Vencido' : 'Crítico'}
                    </span>
                    <Clock size={20} className="text-muted-foreground opacity-30" />
                 </div>
                 <div>
                    <h4 className="font-black text-xl italic leading-none">{alerta.item}</h4>
                    <p className="text-[10px] text-muted-foreground border-l-2 border-primary ml-1 pl-3 mt-3 uppercase font-black tracking-widest">Lote: {alerta.lot}</p>
                 </div>
              </motion.div>
            ))}
         </div>
      </div>
    </div>
  );
}
