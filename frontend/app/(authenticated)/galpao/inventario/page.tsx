'use client';

import React, { useState, useEffect } from 'react';
import QRReader from '@/components/scanner/QRReader';
import { ClipboardList, AlertOctagon, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { obterUnidadesRecebidasRecentes } from '@/app/actions/estoque';

export default function InventarioPage() {
  const [scans, setScans] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5;

  useEffect(() => {
    async function carregarDados() {
      try {
        const dados = await obterUnidadesRecebidasRecentes();
        if (dados && dados.length > 0) {
          setScans(dados.map((u: any) => ({ ...u, currentLocation: u.currentLocation || 'GALPÃO A - CORREDOR 3' })));
        } else {
          // Fallback rico
          setScans([
            { qrCodeValue: 'QR-VG-CAP-001', product: { name: 'Capacete VoltGuard Pro' }, currentLocation: 'GALPÃO A - CORREDOR 1', status: 'AVAILABLE' },
            { qrCodeValue: 'QR-VG-LUV-002', product: { name: 'Luva Isolante Classe 0' }, currentLocation: 'GALPÃO B - CORREDOR 4', status: 'AVAILABLE' },
            { qrCodeValue: 'QR-VG-PRO-003', product: { name: 'Protetor Auditivo H10A' }, currentLocation: 'GALPÃO A - CORREDOR 2', status: 'AVAILABLE' },
            { qrCodeValue: 'QR-VG-OCU-004', product: { name: 'Óculos de Proteção Incolor' }, currentLocation: 'GALPÃO C - CORREDOR 1', status: 'AVAILABLE' },
            { qrCodeValue: 'QR-VG-BOT-005', product: { name: 'Bota de Couro Bico de Aço' }, currentLocation: 'GALPÃO A - CORREDOR 3', status: 'AVAILABLE' },
            { qrCodeValue: 'QR-VG-AVT-006', product: { name: 'Avental de Raspa Soldador' }, currentLocation: 'GALPÃO B - CORREDOR 2', status: 'AVAILABLE' },
            { qrCodeValue: 'QR-VG-MAS-007', product: { name: 'Máscara Respiratória PFF2' }, currentLocation: 'GALPÃO A - CORREDOR 5', status: 'AVAILABLE' }
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();

    const sse = new EventSource('/api/stream/scanner');
    sse.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.context === 'INVENTORY_AUDIT') {
        setScans(prev => [data.unit, ...prev]);
        setPaginaAtual(1);
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
          <ClipboardList size={32} className="text-orange-500" />
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase">Inventário Cego</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Auditoria física com geração de disparidades</p>
          </div>
        </div>
        <QRReader context="INVENTORY_AUDIT" isAdmin={true} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-8 rounded-3xl space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-black uppercase tracking-widest text-white/50">Itens Contados Fisicamente</h3>
            {!carregando && scans.length > 0 && (
              <span className="text-[10px] text-orange-400 font-black tracking-widest">
                {scans.length} BIPADOS
              </span>
            )}
          </div>
          
          <div className="space-y-4 min-h-[350px]">
            {carregando ? (
              <div className="flex justify-center items-center py-24">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
              </div>
            ) : scans.length === 0 ? (
              <p className="text-muted-foreground text-sm italic">Inicie a bipagem no corredor.</p>
            ) : (
              <div className="space-y-3">
                <AnimatePresence mode="wait">
                  {scansPaginados.map((unit, i) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: -5 }}
                      key={unit.qrCodeValue + i} 
                      className="p-4 border border-orange-500/20 bg-orange-500/5 rounded-xl hover:bg-orange-500/10 transition-all duration-300"
                    >
                      <h4 className="font-black text-orange-400 uppercase text-sm">{unit.product?.name || 'Item Sem Nome'}</h4>
                      <p className="text-[9px] uppercase text-muted-foreground font-mono mt-1">
                        Loc: <span className="text-white font-bold">{unit.currentLocation || 'GALPÃO A'}</span> | QR: {unit.qrCodeValue}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Paginação */}
          {!carregando && totalPaginas > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <span className="text-[10px] text-muted-foreground">
                {paginaAtual} de {totalPaginas}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
                  disabled={paginaAtual === 1}
                  className="p-2 glass rounded-lg hover:text-orange-500 transition-all disabled:opacity-30 disabled:hover:text-white"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
                  disabled={paginaAtual === totalPaginas}
                  className="p-2 glass rounded-lg hover:text-orange-500 transition-all disabled:opacity-30 disabled:hover:text-white"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="glass p-8 rounded-3xl bg-purple-500/5 border-purple-500/10 h-fit space-y-6">
          <h3 className="font-black uppercase tracking-widest text-purple-400 flex items-center gap-2">
            <AlertOctagon size={18} /> Sistema Automático
          </h3>
          <p className="text-sm text-white/60 leading-relaxed">
            A cada leitura de QR Code efetuada na área física de armazenagem, o sistema deduz a contagem em relação ao banco de dados corporativo.
          </p>
          <p className="text-sm text-white/60 leading-relaxed">
            Qualquer divergência no final do ciclo gera um registro automático de <strong>Disparidade</strong> para auditoria e controle da Gerência.
          </p>
        </div>
      </div>
    </div>
  );
}
