'use client';

import { AppShell } from "@/components/AppShell";
import { usarAutenticacao } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function LayoutAutenticado({
  children,
}: {
  children: React.ReactNode;
}) {
  const { usuario, carregando } = usarAutenticacao();
  const router = useRouter();

  useEffect(() => {
    if (!carregando && !usuario) {
      router.push('/login');
    }
  }, [usuario, carregando, router]);

  if (carregando || !usuario) {
    return (
      <div className="min-h-screen bg-[#050506] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <AppShell>
      {children}
    </AppShell>
  );
}
