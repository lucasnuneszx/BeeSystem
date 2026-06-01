'use client';

import React, { useState, useEffect } from 'react';
import QRReader from '@/components/scanner/QRReader';
import { ArrowDownToLine, Box } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RecebimentoPage() {
  const [scans, setScans] = useState<any[]>([]);

  useEffect(() => {
    const sse = new EventSource('/api/stream/scanner');
    sse.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.context === 'RECEIVING') {
        setScans(prev => [data.unit, ...prev]);
      }
    };
    return () => sse.close();
  }, []);

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
        <h3 className="font-black uppercase tracking-widest text-white/50 flex items-center gap-2">
          <Box size={18} /> Lidos recentemente
        </h3>
        
        <div className="space-y-4">
          {scans.length === 0 ? (
            <p className="text-muted-foreground text-sm italic">Aguardando leituras de entrada...</p>
          ) : (
            scans.map((unit, i) => (
              <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} key={i} className="p-4 border border-blue-500/20 bg-blue-500/5 rounded-xl flex justify-between items-center">
                <div>
                  <h4 className="font-black text-blue-400">{unit.product.name}</h4>
                  <p className="text-[10px] uppercase text-muted-foreground">LOTE: {unit.lot.code} | QR: {unit.qrCodeValue}</p>
                </div>
                <span className="text-[10px] bg-blue-500 text-black px-2 py-1 rounded font-bold uppercase">Em Estoque</span>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
