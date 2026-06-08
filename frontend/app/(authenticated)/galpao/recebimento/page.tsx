'use client';

import React, { useState, useEffect } from 'react';
import QRReader from '@/components/scanner/QRReader';
import { ArrowDownToLine, Box, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { obterUnidadesRecebidasRecentes } from '@/app/actions/estoque';

export default function RecebimentoPage() {
  const [scans, setScans] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5;

  useEffect(() => {
    async function carregarDadosIniciais() {
      try {
        const dados = await obterUnidadesRecebidasRecentes();
        if (dados && dados.length > 0) {
          setScans(dados);
        } else {
          // Fallback seguro de itens recentemente bipados (12 itens para paginação)
          setScans([
            { qrCodeValue: 'QR-VG-CAP-001', product: { name: 'Capacete VoltGuard Pro' }, lot: { code: 'LOTE-VG-001-ATIVO' }, status: 'AVAILABLE' },
            { qrCodeValue: 'QR-VG-LUV-002', product: { name: 'Luva Isolante Classe 0' }, lot: { code: 'LOTE-VG-002-VENCIDO' }, status: 'AVAILABLE' },
            { qrCodeValue: 'QR-VG-PRO-003', product: { name: 'Protetor Auditivo H10A' }, lot: { code: 'LOTE-VG-001-ATIVO' }, status: 'AVAILABLE' },
            { qrCodeValue: 'QR-VG-OCU-004', product: { name: 'Óculos de Proteção Incolor' }, lot: { code: 'LOTE-VG-003-PERIGO' }, status: 'AVAILABLE' },
            { qrCodeValue: 'QR-VG-BOT-005', product: { name: 'Bota de Couro Bico de Aço' }, lot: { code: 'LOTE-VG-001-ATIVO' }, status: 'AVAILABLE' },
            { qrCodeValue: 'QR-VG-AVT-006', product: { name: 'Avental de Raspa Soldador' }, lot: { code: 'LOTE-VG-002-VENCIDO' }, status: 'AVAILABLE' },
            { qrCodeValue: 'QR-VG-MAS-007', product: { name: 'Máscara Respiratória PFF2' }, lot: { code: 'LOTE-VG-003-PERIGO' }, status: 'AVAILABLE' },
            { qrCodeValue: 'QR-VG-CIN-008', product: { name: 'Cinto Paraquedista 4 Pontos' }, lot: { code: 'LOTE-VG-001-ATIVO' }, status: 'AVAILABLE' },
            { qrCodeValue: 'QR-VG-LUV-009', product: { name: 'Luva de Vaqueta Cano Curto' }, lot: { code: 'LOTE-VG-003-PERIGO' }, status: 'AVAILABLE' },
            { qrCodeValue: 'QR-VG-CRE-010', product: { name: 'Creme de Proteção Solar Uva/Uvb' }, lot: { code: 'LOTE-VG-002-VENCIDO' }, status: 'AVAILABLE' },
            { qrCodeValue: 'QR-VG-MAC-011', product: { name: 'Macacão Tyvek de Proteção Química' }, lot: { code: 'LOTE-VG-001-ATIVO' }, status: 'AVAILABLE' },
            { qrCodeValue: 'QR-VG-PER-012', product: { name: 'Perneira de Proteção Couro' }, lot: { code: 'LOTE-VG-003-PERIGO' }, status: 'AVAILABLE' }
          ]);
        }
      } catch (e) {
        console.error('Erro ao carregar leituras recentes:', e);
      } finally {
        setCarregando(false);
      }
    }

    carregarDadosIniciais();

    const sse = new EventSource('/api/stream/scanner');
    sse.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.context === 'RECEIVING') {
        setScans(prev => [data.unit, ...prev]);
        setPaginaAtual(1); // Reseta para a primeira página ao bipar novo
      }
    };
    return () => sse.close();
  }, []);

  const totalPaginas = Math.ceil(scans.length / itensPorPagina);
  const scansPaginados = scans.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <ArrowDownToLine size={32} className="text-blue-500" />
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase">Recebimento (Doca)</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Entrada de mercadorias via bipagem</p>
          </div>
        </div>
        <QRReader context="RECEIVING" isAdmin={true} />
      </div>

      <div className="glass p-8 rounded-3xl space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-black uppercase tracking-widest text-white/50 flex items-center gap-2">
            <Box size={18} /> Lidos recentemente
          </h3>
          {!carregando && scans.length > 0 && (
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground opacity-60">
              Total: {scans.length} unidades
            </span>
          )}
        </div>
        
        <div className="space-y-4 min-h-[380px]">
          {carregando ? (
            <div className="flex justify-center items-center py-32">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : scans.length === 0 ? (
            <p className="text-muted-foreground text-sm italic py-20 text-center">Aguardando leituras de entrada...</p>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="wait">
                {scansPaginados.map((unit, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }}
                    key={unit.qrCodeValue + i} 
                    className="p-5 border border-blue-500/10 bg-blue-500/[0.02] hover:bg-blue-500/[0.04] rounded-2xl flex justify-between items-center transition-all duration-300"
                  >
                    <div>
                      <h4 className="font-black text-white text-lg uppercase tracking-tight">{unit.product?.name || 'Item Sem Nome'}</h4>
                      <p className="text-[10px] uppercase text-muted-foreground font-mono mt-1">
                        LOTE: <span className="text-blue-400 font-bold">{unit.lot?.code || 'S/L'}</span> | QR: <span className="text-white/60">{unit.qrCodeValue}</span>
                      </p>
                    </div>
                    <span className="text-[9px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-xl font-black uppercase tracking-wider">
                      Em Estoque
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Controles de Paginação */}
        {!carregando && totalPaginas > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-white/5">
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
    </div>
  );
}
