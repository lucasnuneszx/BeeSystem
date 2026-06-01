'use client';

import React, { useState, useEffect } from 'react';
import QRReader from '@/components/scanner/QRReader';
import { ClipboardList, AlertOctagon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InventarioPage() {
  const [scans, setScans] = useState<any[]>([]);

  useEffect(() => {
    const sse = new EventSource('/api/stream/scanner');
    sse.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.context === 'INVENTORY_AUDIT') {
        setScans(prev => [data.unit, ...prev]);
      }
    };
    return () => sse.close();
  }, []);

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
          <h3 className="font-black uppercase tracking-widest text-white/50">Itens Contados Fisicamente</h3>
          <div className="space-y-4">
            {scans.length === 0 ? (
              <p className="text-muted-foreground text-sm italic">Inicie a bipagem no corredor.</p>
            ) : (
              scans.map((unit, i) => (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} key={i} className="p-4 border border-orange-500/20 bg-orange-500/5 rounded-xl">
                  <h4 className="font-black text-orange-400">{unit.product.name}</h4>
                  <p className="text-[10px] uppercase text-muted-foreground">Loc: {unit.currentLocation} | QR: {unit.qrCodeValue}</p>
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div className="glass p-8 rounded-3xl bg-purple-500/5 border-purple-500/10">
          <h3 className="font-black uppercase tracking-widest text-purple-400 flex items-center gap-2 mb-4">
            <AlertOctagon size={18} /> Sistema Automático
          </h3>
          <p className="text-sm text-white/60">
            A cada leitura, o sistema deduz a contagem em relação ao banco de dados. Qualquer divergência no final do ciclo gera um registro automático de <strong>Disparidade</strong> para auditoria da Gerência.
          </p>
        </div>
      </div>
    </div>
  );
}
