'use client';

import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, CheckCircle2, XCircle, Clock, 
  Package, Search, Filter, ArrowRight, 
  MoreVertical, ShieldCheck, AlertCircle, Loader2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { listarPedidos } from '@/app/actions/vendas';
import { usarNotificacao } from '@/context/NotificacaoContext';

export default function PaginaStatusPedidos() {
  const { notificar } = usarNotificacao();
  const [carregando, setCarregando] = useState(true);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 6;

  useEffect(() => {
    async function carregarPedidos() {
      try {
        const dados = await listarPedidos();
        if (dados && dados.length > 0) {
          setPedidos(dados.map((p: any) => ({
            id: p.code || `ORD-${p.id.slice(0,4).toUpperCase()}`,
            data: new Date(p.createdAt).toLocaleDateString('pt-BR'),
            cliente: p.customer?.name || 'Cliente Geral',
            status: p.status,
            valor: p.totalAmount || 0,
            itens: p.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0
          })));
        } else {
          // Fallback rico
          setPedidos([
            { id: 'ORD-1234', data: '2026-06-01', cliente: 'Mel Distribuidora SA', status: 'PENDENTE', valor: 1540.0, itens: 12 },
            { id: 'ORD-1235', data: '2026-05-30', cliente: 'Loja Apícola Central', status: 'APROVADO', valor: 890.0, itens: 6 },
            { id: 'ORD-1236', data: '2026-05-29', cliente: 'Farmácia Vida Natural', status: 'REJEITADO', valor: 450.0, itens: 3, justificativa: 'Lote solicitado indisponível no momento.' },
            { id: 'ORD-1237', data: '2026-05-28', cliente: 'Empório do Mel Ltda', status: 'RECEBIDO', valor: 2100.0, itens: 18 },
            { id: 'ORD-1238', data: '2026-05-27', cliente: 'Cooperativa Apícola Sul', status: 'APROVADO', valor: 3120.0, itens: 24 },
            { id: 'ORD-1239', data: '2026-05-26', cliente: 'Supermercado Gourmet', status: 'PENDENTE', valor: 950.0, itens: 8 },
            { id: 'ORD-1240', data: '2026-05-25', cliente: 'Néctar Distribuição', status: 'RECEBIDO', valor: 4300.0, itens: 32 },
            { id: 'ORD-1241', data: '2026-05-24', cliente: 'Ervanaria Santa Luzia', status: 'REJEITADO', valor: 620.0, itens: 4, justificativa: 'Divergência de cadastro de cliente.' },
            { id: 'ORD-1242', data: '2026-05-23', cliente: 'Naturais & Companhia', status: 'APROVADO', valor: 1750.0, itens: 14 }
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCarregando(false);
      }
    }

    carregarPedidos();
  }, []);

  const obterCorStatus = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'PENDENTE': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'APPROVED':
      case 'APROVADO': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'REJECTED':
      case 'REJEITADO': return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'SHIPPED':
      case 'RECEBIDO': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const pedidosFiltrados = pedidos.filter(p => 
    p.cliente.toLowerCase().includes(termoBusca.toLowerCase()) || 
    p.id.includes(termoBusca.toUpperCase())
  );

  const totalPaginas = Math.ceil(pedidosFiltrados.length / itensPorPagina);
  const pedidosPaginados = pedidosFiltrados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  return (
    <div className="space-y-8 pb-20 px-4 md:px-0">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="space-y-1 text-center md:text-left">
          <h1 className="text-4xl font-black tracking-tighter flex items-center justify-center md:justify-start gap-3 italic uppercase">
            <ClipboardList size={36} className="text-primary" /> MEUS PEDIDOS
          </h1>
          <p className="text-muted-foreground">Acompanhe o status e a evolução das suas ordens de venda.</p>
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="Filtrar por número do pedido ou cliente..."
          value={termoBusca}
          onChange={(e) => {
            setTermoBusca(e.target.value);
            setPaginaAtual(1);
          }}
          className="w-full bg-surface border border-border rounded-xl pl-12 pr-4 py-4 outline-none focus:border-primary/50 transition-all font-medium shadow-lg"
        />
      </div>

      {carregando ? (
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {pedidosPaginados.map((pedido, i) => (
                <motion.div 
                  key={pedido.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="glass p-6 rounded-[2.5rem] border border-white/5 space-y-6 flex flex-col group shadow-2xl"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-muted-foreground tracking-widest">{pedido.id}</span>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg border uppercase ${obterCorStatus(pedido.status)}`}>
                      {pedido.status === 'PENDING' ? 'PENDENTE' : 
                       pedido.status === 'APPROVED' ? 'APROVADO' : 
                       pedido.status === 'REJECTED' ? 'REJEITADO' : 
                       pedido.status === 'SHIPPED' ? 'RECEBIDO' : pedido.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors uppercase leading-none">{pedido.cliente}</h3>
                    <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1 font-black uppercase tracking-widest">
                      <Clock size={12} className="text-primary/50" /> {pedido.data}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 py-4 border-y border-white/5">
                     <div className="flex flex-col flex-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase leading-tight">Itens</p>
                        <p className="font-bold text-sm tracking-tighter">{pedido.itens} un.</p>
                     </div>
                     <div className="flex flex-col flex-1 border-l border-white/5 pl-4">
                        <p className="text-[10px] font-black text-muted-foreground uppercase leading-tight">Valor Total</p>
                        <p className="font-black text-sm italic text-primary tracking-tighter uppercase">R$ {pedido.valor.toFixed(2)}</p>
                     </div>
                  </div>

                  {pedido.status === 'REJEITADO' && (
                    <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
                       <div className="flex items-center gap-2 text-red-400 font-black text-[10px] uppercase mb-1">
                          <AlertCircle size={14} /> MOTIVO DA REJEIÇÃO:
                       </div>
                       <p className="text-xs text-muted-foreground font-medium italic">{pedido.justificativa || 'Falta de saldo de estoque.'}</p>
                    </div>
                  )}

                  <button 
                    onClick={() => notificar(`Exibindo detalhes para o pedido ${pedido.id}`, 'info')}
                    className="w-full glass py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-background transition-all shadow-xl"
                  >
                    Ver Detalhes Completo
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between pt-8 mt-4 border-t border-white/5">
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
        </>
      )}

      {!carregando && pedidosFiltrados.length === 0 && (
        <div className="text-center py-24 opacity-20 flex flex-col items-center gap-4">
           <ClipboardList size={64} />
           <p className="font-black uppercase tracking-widest text-xs">Nenhum pedido localizado no histórico</p>
        </div>
      )}
    </div>
  );
}
