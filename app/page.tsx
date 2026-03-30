'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-8">
      <img 
        src="https://i.imgur.com/x7ATSJy.png" 
        alt="BEESYSTEM" 
        className="w-72 h-auto animate-pulse drop-shadow-[0_0_30px_rgba(245,158,11,0.2)]"
      />
    </div>
  );
}
