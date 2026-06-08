'use client';

import React, { useState, useEffect } from 'react';
import QRReader from '@/components/scanner/QRReader';
import { PackageOpen, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SaidaPage() {
  const [scans, setScans] = useState<any[]>([]);

  useEffect(() => {
    const sse = new EventSource('/api/stream/scanner');
    sse.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.context === 'SHIPPING') {
        setScans(prev => [data.unit, ...prev]);
      }
    };
    return () => sse.close();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <PackageOpen size={32} className="text-primary" />
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase">Saída / Expedição</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Bipagem física de Checkout (RN02)</p>
          </div>
        </div>
        <QRReader context="SHIPPING" isAdmin={true} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-8 rounded-3xl space-y-6 min-h-[400px]">
          <h3 className="font-black uppercase tracking-widest text-white/50 flex items-center gap-2">
            <CheckCircle size={18} /> Histórico de Bipagem (Tempo Real)
          </h3>
          
          <div className="space-y-4">
            {scans.length === 0 ? (
              <p className="text-muted-foreground text-sm italic">Nenhum item bipado nesta sessão.</p>
            ) : (
              scans.map((unit, i) => (
                <motion.div initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} key={i} className="p-4 border border-green-500/20 bg-green-500/5 rounded-xl flex justify-between items-center">
                  <div>
                    <h4 className="font-black text-green-400">{unit.product.name}</h4>
                    <p className="text-[10px] uppercase text-muted-foreground">QR: {unit.qrCodeValue}</p>
                  </div>
                  <span className="text-[10px] bg-green-500 text-black px-2 py-1 rounded font-bold uppercase">Liberado</span>
                </motion.div>
              ))
            )}
          </div>
        </div>
        
        <div className="glass p-8 rounded-3xl bg-red-500/5 border-red-500/10">
          <h3 className="font-black uppercase tracking-widest text-red-500 flex items-center gap-2 mb-4">
            <AlertTriangle size={18} /> Bloqueios de Segurança
          </h3>
          <p className="text-sm text-white/60 mb-4">
            Itens vencidos ou bloqueados pela Qualidade serão automaticamente recusados na doca de expedição, mesmo que constem no pedido. (RN02)
          </p>
        </div>
      </div>
    </div>
  );
}
