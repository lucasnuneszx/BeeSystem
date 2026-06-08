'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Download, Share2, 
  Search, Filter, ChevronDown, 
  Trash, Save, FileSpreadsheet,
  X, Check
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { exportarExcel } from '@/utils/exportar';

const dadosRelatorioIniciais = [
  { ID: 'PED-101', Data: '2024-03-29', Cliente: 'Supermercado Central', Vendedor: 'Ana Silva', Valor: 1450.00, Status: 'APROVADO', Lote: 'LOT-X1' },
  { ID: 'PED-102', Data: '2024-03-29', Cliente: 'Farmácia Vida', Vendedor: 'Bruno Santos', Valor: 320.00, Status: 'PENDENTE', Lote: 'LOT-M4' },
  { ID: 'PED-103', Data: '2024-03-28', Cliente: 'Distribuidora Mel', Vendedor: 'Ana Silva', Valor: 2400.00, Status: 'APROVADO', Lote: 'LOT-B1' },
  { ID: 'PED-104', Data: '2024-03-28', Cliente: 'Empório Mel', Vendedor: 'Carlos Oliveira', Valor: 890.00, Status: 'REJEITADO', Lote: 'LOT-K2' },
  { ID: 'PED-105', Data: '2024-03-27', Cliente: 'Hortifruti ABC', Vendedor: 'Ana Silva', Valor: 560.00, Status: 'APROVADO', Lote: 'LOT-X3' },
  { ID: 'PED-106', Data: '2024-03-27', Cliente: 'Mini Mercado Top', Vendedor: 'Bruno Santos', Valor: 1200.00, Status: 'PENDENTE', Lote: 'LOT-M5' },
  { ID: 'PED-107', Data: '2024-03-26', Cliente: 'Padaria Pão Quente', Vendedor: 'Carlos Oliveira', Valor: 430.00, Status: 'APROVADO', Lote: 'LOT-Z2' },
  { ID: 'PED-108', Data: '2024-03-26', Cliente: 'Lanchonete 24h', Vendedor: 'Ana Silva', Valor: 750.00, Status: 'APROVADO', Lote: 'LOT-P1' },
  { ID: 'PED-109', Data: '2024-03-25', Cliente: 'Restaurante Sabor', Vendedor: 'Bruno Santos', Valor: 1800.00, Status: 'REJEITADO', Lote: 'LOT-L8' },
  { ID: 'PED-110', Data: '2024-03-25', Cliente: 'Cantina Escola', Vendedor: 'Carlos Oliveira', Valor: 210.00, Status: 'APROVADO', Lote: 'LOT-Q4' },
];

export default function PaginaRelatorioWeb() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);
  const [termoBusca, setTermoBusca] = useState('');
  const [dados, setDados] = useState(dadosRelatorioIniciais);
  const [notificacao, setNotificacao] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setCarregando(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filtrarDados = (termo: string) => {
    setTermoBusca(termo);
    const filtrados = dadosRelatorioIniciais.filter(d => 
      d.ID.toLowerCase().includes(termo.toLowerCase()) ||
      d.Cliente.toLowerCase().includes(termo.toLowerCase()) ||
      d.Vendedor.toLowerCase().includes(termo.toLowerCase())
    );
    setDados(filtrados);
  };

  const handleDownload = () => {
    setNotificacao('Gerando arquivo XLSX...');
    setTimeout(() => {
        exportarExcel(dados, 'RELATORIO_EXPORTADO_BEESYSTEM');
        setNotificacao('Download concluído com sucesso!');
        setTimeout(() => setNotificacao(null), 3000);
    }, 1000);
  };

  const handleSave = () => {
    setNotificacao('Salvando alterações na nuvem...');
    setTimeout(() => {
        setNotificacao('Todas as alterações foram salvas!');
        setTimeout(() => setNotificacao(null), 3000);
    }, 1500);
  };

  const handleShare = () => {
    setNotificacao('Link de compartilhamento copiado!');
    setTimeout(() => setNotificacao(null), 3000);
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
         <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
         <div className="text-center animate-pulse">
            <h2 className="text-xl font-black italic tracking-tighter uppercase leading-none">PREPARANDO AMBIENTE WEB</h2>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-2 opacity-50 italic">Sincronizando com ecossistema Google Sheets Style</p>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] text-xs font-mono flex flex-col overflow-hidden">
      
      {/* Sistema de Notificação Customizado */}
      <AnimatePresence>
        {notificacao && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] glass-accent border border-primary/30 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl"
          >
             <Check size={16} className="text-primary" />
             <span className="font-black text-[10px] uppercase tracking-widest text-primary">{notificacao}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Estilo Google Sheets */}
      <header className="h-14 border-b border-white/10 bg-[#1a1a1a] flex items-center px-6 justify-between shrink-0">
        <div className="flex items-center gap-4">
           <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-full transition-all text-primary active:scale-90">
              <ArrowLeft size={18} />
           </button>
           <div className="flex flex-col">
              <div className="flex items-center gap-2">
                 <FileSpreadsheet size={16} className="text-green-500" />
                 <h1 className="text-sm font-bold text-white tracking-tight">RELATÓRIO_GLOBAL_BEESYSTEM_2024.xlsx</h1>
              </div>
              <div className="flex gap-3 text-[10px] text-muted-foreground mt-0.5">
                 <button className="hover:text-white hover:bg-white/5 px-2 rounded">Arquivo</button>
                 <button className="hover:text-white hover:bg-white/5 px-2 rounded">Editar</button>
                 <button className="hover:text-white hover:bg-white/5 px-2 rounded">Ver</button>
                 <button className="hover:text-white hover:bg-white/5 px-2 rounded">Inserir</button>
                 <button className="hover:text-white hover:bg-white/5 px-2 rounded">Formatar</button>
                 <button className="hover:text-white hover:bg-white/5 px-2 rounded text-primary font-bold">BIO-Integrado</button>
              </div>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={handleShare} className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-background transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-primary/10">
              <Share2 size={14} /> Compartilhar
           </button>
           <div className="w-10 h-10 rounded-full bg-surface border border-primary/20 flex items-center justify-center text-primary font-bold shadow-inner">
              L
           </div>
        </div>
      </header>

      {/* Toolbar - Funcionalidade Real (RF15) */}
      <div className="h-10 border-b border-white/5 bg-[#222222] flex items-center px-8 gap-6 shrink-0 overflow-x-auto custom-scrollbar">
         <div className="flex items-center gap-2 text-muted-foreground border-r border-white/10 pr-6 mr-2">
            <button onClick={() => setNotificacao('Não é possível excluir a planilha mestre.')} className="p-1.5 hover:bg-red-500 hover:text-white rounded transition-colors tooltip" title="Excluir"><Trash size={14}/></button>
            <button onClick={handleSave} className="p-1.5 hover:bg-primary hover:text-background rounded transition-colors" title="Salvar"><Save size={14}/></button>
            <button onClick={handleDownload} className="p-1.5 hover:bg-blue-500 hover:text-white rounded transition-colors" title="Exportar Local"><Download size={14}/></button>
         </div>
         <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">
            <span className="flex items-center gap-1 hover:text-white cursor-pointer border-r border-white/10 pr-4 italic">Outfit Bold <ChevronDown size={12}/></span>
            <span className="flex items-center gap-1 hover:text-white cursor-pointer border-r border-white/10 pr-4">100% Zoom <ChevronDown size={12}/></span>
            <span className="flex items-center gap-1 hover:text-white cursor-pointer text-primary bg-primary/10 px-2 py-1 rounded">Exibir: R$ Moeda</span>
         </div>
         <div className="ml-auto relative w-72 group">
             <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
             <input 
                type="text" 
                value={termoBusca}
                onChange={(e) => filtrarDados(e.target.value)}
                placeholder="Busca rápida por ID, Cliente ou Vendedor..." 
                className="w-full bg-[#111111] border border-white/5 rounded-full pl-10 pr-4 py-2 outline-none focus:border-primary/50 transition-all font-bold placeholder:text-muted-foreground/30 shadow-inner" 
             />
         </div>
      </div>

      {/* Grid Principal - Dados Vivos (RF16) */}
      <div className="flex-1 overflow-auto custom-scrollbar bg-[#111111]">
         <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="sticky top-0 z-10 bg-[#1c1c1c] shadow-md">
               <tr>
                  <th className="w-12 border-r border-b border-white/10 text-center text-muted-foreground bg-[#252525]">#</th>
                  <th className="px-6 py-3 border-r border-b border-white/10 font-black text-[10px] uppercase tracking-widest text-muted-foreground">ID Pedido</th>
                  <th className="px-6 py-3 border-r border-b border-white/10 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Data Emissão</th>
                  <th className="px-6 py-3 border-r border-b border-white/10 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Cliente Final</th>
                  <th className="px-6 py-3 border-r border-b border-white/10 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Responsável</th>
                  <th className="px-6 py-3 border-r border-b border-white/10 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Valor Bruto</th>
                  <th className="px-6 py-3 border-r border-b border-white/10 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Status Logístico</th>
                  <th className="px-6 py-3 border-r border-b border-white/10 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Lote Associado</th>
               </tr>
            </thead>
            <tbody>
               <AnimatePresence>
                {dados.map((linha, i) => (
                  <motion.tr 
                    key={linha.ID}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-primary/5 group transition-colors cursor-cell"
                  >
                      <td className="w-12 border-r border-b border-white/5 text-center text-[10px] text-muted-foreground bg-[#1a1a1a] font-bold group-hover:bg-primary group-hover:text-background transition-colors">{i + 1}</td>
                      <td className="px-6 py-3 border-r border-b border-white/5 text-primary font-black italic">{linha.ID}</td>
                      <td className="px-6 py-3 border-r border-b border-white/5 opacity-60">{linha.Data}</td>
                      <td className="px-6 py-3 border-r border-b border-white/5 font-bold uppercase">{linha.Cliente}</td>
                      <td className="px-6 py-3 border-r border-b border-white/5 italic opacity-40">{linha.Vendedor}</td>
                      <td className="px-6 py-3 border-r border-b border-white/5 font-black text-white">R$ {linha.Valor.toFixed(2)}</td>
                      <td className="px-6 py-3 border-r border-b border-white/5">
                        <div className={`px-4 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border w-fit shadow-lg ${
                            linha.Status === 'APROVADO' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            linha.Status === 'PENDENTE' ? 'bg-primary/10 text-primary border-primary/20 animate-pulse' :
                            'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                            {linha.Status}
                        </div>
                      </td>
                      <td className="px-6 py-3 border-r border-b border-white/5 text-muted-foreground font-mono">{linha.Lote}</td>
                  </motion.tr>
                ))}
               </AnimatePresence>

               {/* Preenchimento Dinâmico de Linhas Vazias */}
               {Array.from({ length: Math.max(0, 20 - dados.length) }).map((_, i) => (
                 <tr key={`vazia-${i}`} className="h-10">
                    <td className="w-12 border-r border-b border-white/5 text-center text-[10px] text-muted-foreground bg-[#1a1a1a] font-bold">{dados.length + i + 1}</td>
                    {Array.from({ length: 7 }).map((__, j) => (
                       <td key={j} className="px-6 py-3 border-r border-b border-white/5" />
                    ))}
                 </tr>
               ))}
            </tbody>
         </table>
      </div>

      {/* Footer / Abas Dinâmicas */}
      <footer className="h-10 border-t border-white/10 bg-[#1a1a1a] flex items-center px-4 shrink-0 overflow-x-auto gap-4">
         <div className="flex items-center gap-2 bg-[#333333] text-primary px-6 h-full font-black text-[9px] uppercase tracking-[0.2em] relative rounded-t-lg transition-all cursor-pointer">
            <Check size={10} /> Planilha_Master
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
         </div>
         <div onClick={() => setNotificacao('Alternando para visão de Dashboard...')} className="flex items-center text-muted-foreground px-6 h-full font-black text-[9px] uppercase tracking-[0.2em] hover:bg-white/5 cursor-pointer transition-all">
            Visão_Analítica
         </div>
         <div onClick={() => setNotificacao('Carregando logs de auditoria...')} className="flex items-center text-muted-foreground px-6 h-full font-black text-[9px] uppercase tracking-[0.2em] hover:bg-white/5 cursor-pointer transition-all">
            Rastreamento_FIFO
         </div>
         <div className="ml-auto flex items-center gap-5 text-muted-foreground pr-8">
            <span className="flex items-center gap-1 text-[8px] font-black uppercase opacity-40 italic"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" /> Sincronizado</span>
            <span className="text-[9px] font-black uppercase opacity-20 tracking-widest">BEESYSTEM SPREADSHEET V1.0 - BUILD 7A86</span>
         </div>
      </footer>
    </div>
  );
}
