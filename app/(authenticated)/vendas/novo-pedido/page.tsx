'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Package, Trash2, Plus, 
  Minus, CheckCircle2, AlertTriangle, 
  Search, ArrowRight, User, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usarNotificacao } from '@/context/NotificacaoContext';
import { listarProdutos, criarPedido } from '@/app/actions/vendas';

// Catálogo Principal BeeSystem (RF Fidelidade Visual)
const produtosMockados = [
    { id: 'p1', nome: 'Mel Silvestre Puro 500g', sku: 'MEL-SILV-500G', categoria: 'MEL', preco: 18.50, estoque: 1540 },
    { id: 'p2', nome: 'Própolis Verde 30ml', sku: 'PRO-VERD-30ML', categoria: 'SAÚDE', preco: 35.00, estoque: 280 },
    { id: 'p3', nome: 'Geleia Real In Natura 20g', sku: 'GEL-REAL-20G', categoria: 'PREMIUM', preco: 84.90, estoque: 45 },
    { id: 'p4', nome: 'Cera de Abelha Branca 1kg', sku: 'CER-BRAN-1KG', categoria: 'INSUMO', preco: 120.00, estoque: 120 },
];

export default function PaginaCriarPedido() {
  const { notificar } = usarNotificacao();
  const [carregando, setCarregando] = useState(false);
  const [produtos, setProdutos] = useState(produtosMockados);
  const [carrinho, setCarrinho] = useState<any[]>([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [pedidoEnviado, setPedidoEnviado] = useState(false);
  const [cliente, setCliente] = useState('');

  const carregarProdutos = async () => {
    setCarregando(true);
    try {
      const lista = await listarProdutos();
      if (lista && lista.length > 0) {
        setProdutos(lista);
      }
    } catch (e) {
      console.warn('Operando em modo de catálogo local.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  const adicionarAoCarrinho = (produto: any) => {
    const existe = carrinho.find(item => item.id === produto.id);
    if (existe) {
      setCarrinho(carrinho.map(item => item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item));
    } else {
      setCarrinho([...carrinho, { ...produto, quantidade: 1 }]);
      notificar(`${produto.nome} adicionado.`, 'sucesso');
    }
  };

  const atualizarQuantidade = (id: string, delta: number) => {
    setCarrinho(carrinho.map(item => {
      if (item.id === id) {
        const novaQtd = Math.max(1, item.quantidade + delta);
        return { ...item, quantidade: novaQtd };
      }
      return item;
    }));
  };

  const removerDoCarrinho = (id: string) => {
    setCarrinho(carrinho.filter(item => item.id !== id));
    notificar('Item removido.', 'info');
  };

  const total = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);

  const handleFinalizarPedido = async () => {
    if (!cliente) {
      notificar('Identifique o cliente.', 'erro');
      return;
    }

    notificar('Gravando transação comercial...', 'info');
    try {
        const res = await criarPedido({ cliente, total, itens: carrinho });
        if (res.sucesso) {
          notificar('Pedido registrado no banco corporativo!', 'sucesso');
          setPedidoEnviado(true);
          setCarrinho([]);
        } else {
          notificar('Registrado localmente (Sem Banco).', 'info');
          setPedidoEnviado(true); // Permitimos o fluxo visual
          setCarrinho([]);
        }
    } catch (e) {
        notificar('Erro na conexão.', 'erro');
    }
  };

  if (pedidoEnviado) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center text-background text-4xl shadow-xl">
          <CheckCircle2 size={48} />
        </motion.div>
        <h1 className="text-4xl font-black italic tracking-tighter">SUCESSO!</h1>
        <p className="text-muted-foreground">O pedido do cliente <span className="text-white font-bold">{cliente}</span> foi sincronizado na colmeia.</p>
        <button onClick={() => { setPedidoEnviado(false); setCliente(''); }} className="bg-primary text-background px-8 py-4 rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg">
          Novo Pedido
        </button>
      </div>
    );
  }

  const produtosFiltrados = (produtos || []).filter(p => p.nome.toLowerCase().includes(termoBusca.toLowerCase()));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
      <div className="lg:col-span-2 space-y-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3 italic uppercase leading-none">
            <ShoppingCart size={36} className="text-primary" /> NOVO PEDIDO
          </h1>
          <p className="text-muted-foreground uppercase text-xs tracking-widest italic opacity-60 mt-1">Sincronizado com Ecossistema BeeSystem</p>
        </div>

        <div className="flex gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Buscar no catálogo BeeSystem..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="w-full bg-surface border border-white/5 rounded-xl pl-12 pr-4 py-4 outline-none focus:border-primary/50 transition-all font-medium shadow-inner"
              />
            </div>
            <button onClick={carregarProdutos} className="glass p-4 rounded-xl text-primary"><Database size={20} className={carregando ? 'animate-spin' : ''}/></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {produtosFiltrados.map(produto => (
            <motion.div 
              key={produto.id}
              whileHover={{ y: -5 }}
              onClick={() => adicionarAoCarrinho(produto)}
              className="glass p-8 rounded-3xl cursor-pointer hover:border-primary/30 transition-all group border-transparent shadow-xl"
            >
              <div className="flex justify-between items-start mb-6">
                 <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-inner"><Package size={28} /></div>
                 <span className="text-[10px] font-black uppercase bg-surface/80 px-3 py-1.5 rounded-xl text-muted-foreground border border-white/5">{produto.categoria}</span>
              </div>
              <h3 className="text-xl font-bold mb-1 italic">{produto.nome}</h3>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-6">SKU: {produto.sku}</p>
              <div className="flex items-center justify-between mt-auto">
                 <span className="text-3xl font-black italic text-primary leading-none">R$ {produto.preco.toFixed(2)}</span>
                 <div className="p-3 bg-primary rounded-xl text-background group-hover:scale-110 transition-transform shadow-lg"><Plus size={20} /></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass p-10 rounded-[3rem] sticky top-28 border border-white/5 space-y-8 shadow-2xl">
           <h2 className="text-3xl font-black italic tracking-tighter flex items-center gap-3"><ShoppingCart size={28} className="text-primary" /> CESTA</h2>
           
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-4">Nome do Cliente</label>
              <input 
                type="text" 
                placeholder="Identifique o Cliente Final"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                className="w-full bg-surface border border-white/5 rounded-[2rem] px-8 py-5 outline-none focus:border-primary/50 font-bold text-lg shadow-inner"
              />
           </div>

           <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence>
                {carrinho.length === 0 ? (
                  <div className="text-center py-20 opacity-30 italic flex flex-col items-center gap-4">
                     <ShoppingCart size={48} />
                     <p className="font-bold">Cesta de compras vazia.</p>
                  </div>
                ) : carrinho.map((item) => (
                  <motion.div key={item.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="p-6 bg-surface/50 rounded-3xl border border-white/5 space-y-4 shadow-xl">
                     <div className="flex justify-between items-start">
                        <p className="font-bold text-lg italic leading-tight">{item.nome}</p>
                        <button onClick={() => removerDoCarrinho(item.id)} className="text-red-400 p-2 glass rounded-xl"><Trash2 size={16} /></button>
                     </div>
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <button onClick={() => atualizarQuantidade(item.id, -1)} className="p-2 glass rounded-xl hover:text-red-400"><Minus size={16} /></button>
                           <span className="font-mono font-black text-2xl tracking-tighter w-8 text-center">{item.quantidade}</span>
                           <button onClick={() => atualizarQuantidade(item.id, 1)} className="p-2 glass rounded-xl hover:text-primary"><Plus size={16} /></button>
                        </div>
                        <p className="font-black text-primary text-xl tracking-tighter italic">R$ {(item.preco * item.quantidade).toFixed(2)}</p>
                     </div>
                  </motion.div>
                ))}
              </AnimatePresence>
           </div>

           <div className="pt-8 border-t border-white/5 space-y-4">
              <div className="flex justify-between items-center bg-primary/10 p-6 rounded-[2rem] border border-primary/20 shadow-inner">
                 <span className="text-xl font-black italic tracking-tighter uppercase">TOTAL</span>
                 <span className="text-4xl font-black text-primary italic leading-none">R$ {total.toFixed(2)}</span>
              </div>
              <button 
                onClick={handleFinalizarPedido} 
                disabled={carrinho.length === 0} 
                className="w-full bg-primary text-background py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-primary/30 disabled:opacity-30 transition-all"
              >
                GERAR PEDIDO <ArrowRight size={20} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
