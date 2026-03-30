import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ProvedorAutenticacao } from "@/context/AuthContext";
import { ProvedorDeNotificacao } from "@/context/NotificacaoContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BEESYSTEM | Gestão Logística Corporativa",
  description: "Sistema premium de gestão logística e estoque.",
};

export default function LayoutRaiz({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased selection:bg-primary selection:text-background`}>
        <div className="bg-beesystem" />
        <div className="honeycomb-overlay" />
        <ProvedorDeNotificacao>
          <ProvedorAutenticacao>
            {children}
          </ProvedorAutenticacao>
        </ProvedorDeNotificacao>
      </body>
    </html>
  );
}
