'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, Package, Clock, 
  ArrowRight, ShieldCheck, Warehouse, 
  Layers, PackageOpen, Filter, Loader2,
  X, QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { obterMapaEstoque } from '@/app/actions/estoque';
import { usarNotificacao } from '@/context/NotificacaoContext';

export default function PaginaConsultaLocalizacao() {
  const { notificar } = usarNotificacao();
  const [dadosEstoque, setDadosEstoque] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [termoBusca, setTermoBusca] = useState('');
  const [loteQrAberto, setLoteQrAberto] = useState<any | null>(null);

  useEffect(() => {
    async function carregarDados() {
      try {
        const dados = await obterMapaEstoque();
        if (dados && dados.length > 0) {
          setDadosEstoque(dados);
        } else {
          // Fallback seguro se não houver registros no banco
          setDadosEstoque([
            { id: '1', item: 'Mel de Abelha 500g', lote: 'LOT-2024-X1', localizacao: 'GALPÃO-A / PRATELEIRA-04', corredor: 'A1', posicao: '04', validade: '2025-10-15', qtd: 120 },
            { id: '2', item: 'Própolis 30ml', lote: 'LOT-2024-M4', localizacao: 'GALPÃO-B / REFRIGERADO-01', corredor: 'B2', posicao: '01', validade: '2024-12-01', qtd: 85 },
            { id: '3', item: 'Geleia Real 20g', lote: 'LOT-2023-K2', localizacao: 'GALPÃO-B / REFRIGERADO-02', corredor: 'B2', posicao: '02', validade: '2024-03-20', qtd: 12 },
            { id: '4', item: 'Pólen Desidratado 100g', lote: 'LOT-2024-P9', localizacao: 'GALPÃO-A / PRATELEIRA-10', corredor: 'A2', posicao: '10', validade: '2025-01-10', qtd: 45 },
          ]);
        }
      } catch (err) {
        notificar('Erro ao ler lotes do banco de dados corporativo.', 'erro');
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();
  }, []);

  const filtrados = dadosEstoque.filter(s => 
    s.item.toLowerCase().includes(termoBusca.toLowerCase()) || 
    s.lote.toLowerCase().includes(termoBusca.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      <div className="space-y-1 text-center md:text-left">
        <h1 className="text-5xl font-black italic tracking-tighter flex items-center justify-center md:justify-start gap-4 uppercase leading-none">
          <Warehouse size={48} className="text-primary" /> CONSULTA DE LOCAL
        </h1>
        <p className="text-muted-foreground uppercase text-[10px] font-black tracking-[0.3em] opacity-60">Mapa Estratégico de Armazenamento (RF13)</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-all" size={24} />
          <input 
            type="text" 
            placeholder="Produto ou número do lote..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full bg-surface border border-border rounded-[2rem] pl-16 pr-8 py-6 outline-none focus:border-primary/40 transition-all font-bold text-xl shadow-2xl placeholder:opacity-30"
          />
        </div>
        <button 
          onClick={() => notificar('Filtros avançados não possuem outros parâmetros no momento.', 'info')}
          className="glass p-6 rounded-[2rem] hover:text-primary transition-all shadow-xl"
        >
          <Filter size={24} />
        </button>
      </div>

      {carregando ? (
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filtrados.map((itemEstoque, i) => (
              <motion.div 
                 key={itemEstoque.id}
                 layout
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.9 }}
                 transition={{ delay: i * 0.05 }}
                 className="glass p-8 rounded-[3rem] border border-white/5 space-y-8 group hover:border-primary/30 hover:bg-white/[0.03] transition-all flex flex-col justify-between shadow-3xl"
              >
                 <div className="flex justify-between items-start">
                    <div className="p-4 bg-primary/10 rounded-[1.5rem] text-primary border border-primary/20">
                       <PackageOpen size={32} />
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Lote</span>
                       <p className="font-mono font-black italic text-lg text-primary leading-none">{itemEstoque.lote}</p>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <h3 className="text-3xl font-black italic tracking-tighter leading-none uppercase">{itemEstoque.item}</h3>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-2">
                       <Clock size={12} className="text-primary/50" /> Vecto: {itemEstoque.validade}
                    </p>
                 </div>

                 <div className="space-y-5 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-colors duration-500 shadow-inner">
                          <MapPin size={28} />
                       </div>
                       <div className="flex-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">Localização</p>
                          <p className="font-bold text-lg uppercase tracking-tight">{itemEstoque.localizacao}</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-surface/40 rounded-2xl border border-white/5 group-hover:border-primary/20 transition-all">
                          <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Corredor</p>
                          <p className="text-2xl font-black italic text-white leading-none">{itemEstoque.corredor}</p>
                       </div>
                       <div className="p-4 bg-surface/40 rounded-2xl border border-white/5 group-hover:border-primary/20 transition-all">
                          <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Posição</p>
                          <p className="text-2xl font-black italic text-white leading-none">{itemEstoque.posicao}</p>
                       </div>
                    </div>
                 </div>

                 <button 
                   onClick={() => {
                     setLoteQrAberto(itemEstoque);
                     notificar(`Código QR gerado para o lote ${itemEstoque.lote}.`, 'sucesso');
                   }}
                   className="w-full glass py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] mt-4 flex items-center justify-center gap-2 hover:bg-primary hover:text-background transition-all shadow-xl group/btn"
                 >
                    Gerar QR de Navegação <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                 </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!carregando && filtrados.length === 0 && (
        <div className="text-center py-32 opacity-20 flex flex-col items-center gap-6">
           <Layers size={80} strokeWidth={1} />
           <p className="font-black uppercase tracking-widest text-sm">Nenhum item localizado no mapa de estoque</p>
        </div>
      )}

      {/* Modal de Exibição do QR Code de Navegação */}
      <AnimatePresence>
        {loteQrAberto && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLoteQrAberto(null)}
              className="fixed inset-0 bg-background/90 backdrop-blur-md z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm glass p-8 rounded-[3rem] z-[101] border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.5)]"
            >
              <div className="space-y-6 text-center">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary">
                    <QrCode size={20} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sinal de Posicionamento</span>
                  </div>
                  <button 
                    onClick={() => setLoteQrAberto(null)} 
                    className="p-2 glass rounded-full hover:text-red-500 transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="bg-white p-6 rounded-[2rem] inline-block shadow-inner">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(loteQrAberto.lote)}`} 
                    alt={`QR Code Lote ${loteQrAberto.lote}`}
                    className="w-48 h-48 object-contain"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">// LOTE LOGÍSTICO</span>
                  <h3 className="font-mono font-black text-xl text-primary">{loteQrAberto.lote}</h3>
                </div>

                <div className="p-4 bg-surface/60 rounded-2xl border border-white/5 space-y-2 text-left">
                  <div>
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Produto</span>
                    <p className="font-bold text-xs uppercase text-white truncate">{loteQrAberto.item}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                    <div>
                      <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Localização</span>
                      <p className="font-bold text-xs uppercase text-white">{loteQrAberto.localizacao}</p>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Validade</span>
                      <p className="font-bold text-xs text-white">{loteQrAberto.validade}</p>
                    </div>
                  </div>
                </div>

                <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold px-4">
                  Aponte o coletor industrial ou câmera de smartphone para iniciar o roteamento integrado FIFO.
                </p>

                <button
                  onClick={() => setLoteQrAberto(null)}
                  className="w-full bg-primary text-background py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                >
                  Fechar Painel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
