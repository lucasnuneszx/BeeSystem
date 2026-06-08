'use client';

import { cn } from "@/lib/utils";
import { useState } from "react";
import { KeyRound, Mail, Sparkles } from "lucide-react";

export default function Example() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ação de login fictícia ou integração com handleLogin
    console.log("Submit:", { email, password });
  };

  return (
    <div className="flex min-h-screen w-full bg-[#030304] text-white">
      {/* Lado Esquerdo: Identidade VoltGuard BeeSystem */}
      <div className="w-full hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-[#080c14] to-[#030304] border-r border-white/5 relative overflow-hidden">
        {/* Grade HUD */}
        <div className="absolute inset-0 pointer-events-none opacity-20" style={{
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        <div className="absolute top-1/3 left-1/3 w-[250px] h-[250px] bg-yellow-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-md text-center p-8">
          <div className="relative p-2 rounded-3xl border border-white/5 bg-[#090d14]/40 backdrop-blur-md">
            <img 
              className="w-72 h-72 object-contain drop-shadow-[0_0_30px_rgba(255,204,0,0.15)]" 
              src="/cybernetic_bee.png" 
              alt="VoltGuard Bee" 
            />
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase mt-8 text-white">
            Volt<span className="text-[#ffcc00]">Guard</span>
          </h1>
          <p className="text-[10px] text-[#ffcc00] tracking-[0.3em] font-mono mt-2 uppercase font-bold">
            // BEESYSTEM OPERATION CONSOLE
          </p>
          <p className="text-xs text-gray-400 mt-4 leading-relaxed font-light px-6">
            Rastreabilidade e integridade total de EPIs críticos, operando em conformidade com algoritmos FIFO de descarga e despacho.
          </p>
        </div>
      </div>
  
      {/* Lado Direito: Formulário de Autenticação */}
      <div className="w-full flex flex-col items-center justify-center p-8 bg-[#030304] relative">
        {/* Luz de fundo do formulário */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-yellow-500/[0.02] rounded-full blur-[120px] pointer-events-none" />

        <form onSubmit={handleSubmit} className="md:w-96 w-80 flex flex-col items-center justify-center relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#ffcc00] animate-pulse" />
            <span className="text-[9px] font-mono text-[#ffcc00] tracking-[0.2em] uppercase font-bold">Autenticação Requerida</span>
          </div>
          <h2 className="text-4xl text-white font-black tracking-tighter italic uppercase">Sign In</h2>
          <p className="text-xs text-gray-400 mt-2 text-center uppercase tracking-wider font-light">Seja bem-vindo de volta! Insira suas credenciais.</p>

          <div className="flex items-center gap-4 w-full my-6">
            <div className="w-full h-px bg-white/10"></div>
            <p className="text-nowrap text-[10px] font-mono text-gray-500 uppercase tracking-widest">Acesso Corporativo</p>
            <div className="w-full h-px bg-white/10"></div>
          </div>

          {/* Input de Email */}
          <div className="flex items-center w-full bg-white/[0.02] border border-white/10 hover:border-[#ffcc00]/30 focus-within:border-[#ffcc00]/60 h-12 rounded-full overflow-hidden pl-6 gap-3 transition-colors">
            <Mail size={16} className="text-gray-500" />
            <input 
              type="email" 
              placeholder="E-mail Corporativo" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent text-white placeholder-gray-500 outline-none text-xs w-full h-full font-medium" 
              required 
            />                 
          </div>

          {/* Input de Senha */}
          <div className="flex items-center mt-4 w-full bg-white/[0.02] border border-white/10 hover:border-[#ffcc00]/30 focus-within:border-[#ffcc00]/60 h-12 rounded-full overflow-hidden pl-6 gap-3 transition-colors">
            <KeyRound size={16} className="text-gray-500" />
            <input 
              type="password" 
              placeholder="Senha de Acesso" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent text-white placeholder-gray-500 outline-none text-xs w-full h-full font-medium" 
              required 
            />
          </div>

          <div className="w-full flex items-center justify-between mt-6 text-gray-400 font-mono text-[10px] uppercase tracking-wider">
            <div className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                className="h-4 w-4 rounded border-white/10 bg-white/[0.02] text-[#ffcc00] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#ffcc00]" 
                type="checkbox" 
                id="checkbox" 
              />
              <label htmlFor="checkbox" className="cursor-pointer">Lembrar-me</label>
            </div>
            <a className="hover:text-[#ffcc00] hover:underline transition-colors" href="#">Recuperar Senha</a>
          </div>

          <button 
            type="submit" 
            className="mt-8 w-full h-12 rounded-full text-black bg-[#ffcc00] hover:bg-[#ffe066] font-mono text-xs uppercase tracking-widest font-bold shadow-[0_4px_20px_rgba(255,204,0,0.15)] hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Acessar Console
          </button>
          
          <p className="text-gray-500 text-[10px] font-mono uppercase tracking-wider mt-6">
            Não tem acesso? <a className="text-[#ffcc00] hover:underline" href="#">Solicitar Registro</a>
          </p>
        </form>
      </div>
    </div>
  );
}
