'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usarAutenticacao } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { usuario, carregando } = usarAutenticacao();

  useEffect(() => {
    if (!carregando) {
      if (usuario) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [router, usuario, carregando]);

  return (
    <div className="min-h-screen bg-[#050506] flex flex-col items-center justify-center gap-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-beesystem opacity-10" />
      <div className="honeycomb-overlay opacity-20" />

      <div className="z-10 flex flex-col items-center gap-10">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-[60px] animate-pulse" />
          <img
            src="https://img.icons8.com/isometric/200/bee.png"
            alt="BEESYSTEM"
            className="w-48 h-auto animate-bounce drop-shadow-[0_0_30px_rgba(245,158,11,0.4)] relative"
          />
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-6xl font-black italic tracking-tighter text-white">
            BEE<span className="text-primary">SYSTEM</span>
          </h1>
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-50">Sincronizando Ecossistema...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
