'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

type TipoNotificacao = 'sucesso' | 'erro' | 'info';

interface Notificacao {
  id: number;
  tipo: TipoNotificacao;
  mensagem: string;
}

interface ContextoNotificacao {
  notificar: (mensagem: string, tipo: TipoNotificacao) => void;
}

const NotificacaoContext = createContext<ContextoNotificacao | undefined>(undefined);

export function ProvedorDeNotificacao({ children }: { children: React.ReactNode }) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);

  const notificar = useCallback((mensagem: string, tipo: TipoNotificacao) => {
    const id = Date.now();
    setNotificacoes((prev) => [...prev, { id, tipo, mensagem }]);
    setTimeout(() => {
      setNotificacoes((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  }, []);

  return (
    <NotificacaoContext.Provider value={{ notificar }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {notificacoes.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className={`
                pointer-events-auto p-5 rounded-[1.2rem] glass min-w-[320px] max-w-sm
                flex items-start gap-4 shadow-2xl border border-white/5
                ${n.tipo === 'sucesso' ? 'border-primary/30 bg-primary/5' : n.tipo === 'erro' ? 'border-red-500/30 bg-red-500/5' : 'border-blue-500/30 bg-blue-500/5'}
              `}
            >
              <div className={`mt-1 ${n.tipo === 'sucesso' ? 'text-primary' : n.tipo === 'erro' ? 'text-red-500' : 'text-blue-500'}`}>
                {n.tipo === 'sucesso' && <CheckCircle size={22} />}
                {n.tipo === 'erro' && <AlertCircle size={22} />}
                {n.tipo === 'info' && <Info size={22} />}
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{n.tipo}</p>
                <p className="text-sm font-bold text-white/90 leading-tight">{n.mensagem}</p>
              </div>
              <button 
                onClick={() => setNotificacoes((prev) => prev.filter((item) => item.id !== n.id))}
                className="opacity-20 hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificacaoContext.Provider>
  );
}

export function usarNotificacao() {
  const context = useContext(NotificacaoContext);
  if (!context) throw new Error('usarNotificacao deve ser usado dentro de um ProvedorDeNotificacao');
  return context;
}
