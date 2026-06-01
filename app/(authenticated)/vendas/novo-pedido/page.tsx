'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Save, Plus, ArrowRight } from 'lucide-react';
import { criarPedido, obterDadosNovoPedido } from '@/app/actions/vendas';
import { usarNotificacao } from '@/context/NotificacaoContext';
import { useRouter } from 'next/navigation';

export default function NovoPedidoPage() {
  const { notificar } = usarNotificacao();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [clientes, setClientes] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  
  const [clienteSelecionado, setClienteSelecionado] = useState('');
  const [itens, setItens] = useState([{ produtoId: '', quantidade: 1 }]);

  useEffect(() => {
    obterDadosNovoPedido().then(data => {
      setClientes(data.clientes);
      setProdutos(data.produtos);
      setLoading(false);
    });
  }, []);

  const handleSalvar = async () => {
    if (!clienteSelecionado) {
      notificar('Selecione um cliente', 'erro');
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await criarPedido({
        customerId: clienteSelecionado,
        items: itens.map(item => ({
          productId: item.produtoId,
          quantity: item.quantidade
        }))
      });
      if (res.sucesso) {
        notificar('Pedido criado com sucesso!', 'sucesso');
        router.push('/vendas/historico');
      } else {
        notificar(res.erro || 'Erro ao criar pedido', 'erro');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10">Carregando dados...</div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4 border-b border-white/5 pb-6">
        <ShoppingCart size={32} className="text-primary" />
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">Novo Pedido</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Criação de ordem de venda com abatimento FIFO</p>
        </div>
      </div>

      <div className="glass p-8 rounded-3xl space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-primary">Cliente</label>
          <select 
            className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-primary"
            value={clienteSelecionado}
            onChange={(e) => setClienteSelecionado(e.target.value)}
          >
            <option value="">-- Selecione o Cliente --</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.name} - {c.document}</option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-white/50 border-b border-white/10 pb-2">Itens do Pedido</h3>
          
          {itens.map((item, i) => (
            <div key={i} className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest">Produto</label>
                <select 
                  className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-white outline-none"
                  value={item.produtoId}
                  onChange={(e) => {
                    const novosItens = [...itens];
                    novosItens[i].produtoId = e.target.value;
                    setItens(novosItens);
                  }}
                >
                  <option value="">Selecione...</option>
                  {produtos.map(p => (
                    <option key={p.id} value={p.id}>{p.code} - {p.name} (R$ {p.price})</option>
                  ))}
                </select>
              </div>
              <div className="w-32 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest">Qtd</label>
                <input 
                  type="number" min="1"
                  className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-white outline-none"
                  value={item.quantidade}
                  onChange={(e) => {
                    const novosItens = [...itens];
                    novosItens[i].quantidade = parseInt(e.target.value) || 1;
                    setItens(novosItens);
                  }}
                />
              </div>
            </div>
          ))}
          
          <button 
            onClick={() => setItens([...itens, { produtoId: '', quantidade: 1 }])}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary mt-4"
          >
            <Plus size={14} /> Adicionar Item
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSalvar}
          disabled={submitting}
          className="bg-primary text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-yellow-400 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {submitting ? 'Salvando...' : 'Finalizar Pedido'} <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
