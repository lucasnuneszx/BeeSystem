'use client';

import React, { useEffect, useState } from 'react';
import { QrCode, X, Play, Loader2 } from 'lucide-react';
import { usarNotificacao } from '@/context/NotificacaoContext';

interface QRReaderProps {
  onScanSuccess?: (result: any) => void;
  context: 'RECEIVING' | 'SHIPPING' | 'INVENTORY_AUDIT';
  isAdmin?: boolean;
}

export default function QRReader({ onScanSuccess, context, isAdmin = false }: QRReaderProps) {
  const { notificar } = usarNotificacao();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scannerInstance, setScannerInstance] = useState<any>(null);

  useEffect(() => {
    if (!isOpen) return;

    let scanner: any = null;

    const initScanner = async () => {
      const { Html5QrcodeScanner } = await import('html5-qrcode');
      
      scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(async (decodedText: string) => {
        scanner.pause(true);
        await processQRCode(decodedText);
        scanner.resume();
      }, (error: any) => {
        // ignore
      });
      
      setScannerInstance(scanner);
    };

    initScanner();

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [isOpen]);

  const processQRCode = async (code: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/scanner/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, context })
      });
      const data = await res.json();
      
      if (data.success) {
        notificar(`Leitura Efetuada: ${data.unit.product.name}`, 'sucesso');
        if (onScanSuccess) onScanSuccess(data);
      } else {
        notificar(`Erro: ${data.message}`, 'erro');
      }
    } catch (error) {
      notificar('Falha de conexão com servidor.', 'erro');
    } finally {
      setLoading(false);
    }
  };

  const simulateDemoScan = async () => {
    const fakeCode = 'PROD-VG-9997'; // Lote válido gerado no seed especial
    await processQRCode(fakeCode);
  };
  
  const simulateErrorScan = async () => {
    const fakeCode = 'PROD-VG-9999-ERROR'; // Erro forçado
    await processQRCode(fakeCode);
  };

  return (
    <>
      <div className="flex gap-4">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-[#FACC15] text-black px-6 py-3 rounded uppercase font-black tracking-widest hover:bg-[#EAB308] transition-all"
        >
          <QrCode size={20} />
          Iniciar Leitura QR
        </button>

        {isAdmin && (
          <div className="flex flex-col gap-2 border-l border-white/10 pl-4">
            <span className="text-[10px] text-white/50 uppercase tracking-widest">Modo Demo</span>
            <div className="flex gap-2">
              <button
                onClick={simulateDemoScan}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded uppercase font-bold text-xs hover:bg-blue-600/40 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={14} /> : <Play size={14} />}
                Simular OK
              </button>
              <button
                onClick={simulateErrorScan}
                disabled={loading}
                className="flex items-center gap-2 bg-red-600/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded uppercase font-bold text-xs hover:bg-red-600/40 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={14} /> : <X size={14} />}
                Simular ERRO
              </button>
            </div>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#02050A] border border-white/10 rounded-2xl p-6 relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-xl font-black italic uppercase tracking-tighter mb-4 text-white">Leitura Física (QR)</h3>
            <p className="text-sm text-white/50 mb-6">Aponte a câmera para o QR Code individual da unidade.</p>
            
            <div id="reader" className="rounded-lg overflow-hidden border-2 border-white/5 bg-black"></div>
          </div>
        </div>
      )}
    </>
  );
}
