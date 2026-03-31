'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { usarAutenticacao } from '@/context/AuthContext';
import { usarNotificacao } from '@/context/NotificacaoContext';
import { Lock, Mail, ChevronRight, Loader2, Sparkles, ShieldCheck } from 'lucide-react';

export default function PaginaLogin() {
    const { entrar } = usarAutenticacao();
    const { notificar } = usarNotificacao();
    const router = useRouter();
    const [carregando, setCarregando] = useState(false);
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setCarregando(true);

        try {
            const result = await entrar(email);

            if (result.sucesso) {
                notificar(`Autenticação efetuada com sucesso!`, 'sucesso');
                router.push('/dashboard');
            } else {
                notificar(result.mensagem || 'Credenciais inválidas.', 'erro');
            }
        } catch (error) {
            notificar('Erro na comunicação com o servidor.', 'erro');
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#050506]">
            {/* Background Decorativo */}
            <div className="absolute inset-0 bg-beesystem opacity-20 pointer-events-none" />
            <div className="honeycomb-overlay opacity-30 pointer-events-none" />

            {/* Orbes de Luz */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" />

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-[480px] z-10 px-6"
            >
                <div className="glass p-12 rounded-[3.5rem] border border-white/5 shadow-3xl space-y-10 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

                    <div className="text-center space-y-4">
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-primary/10 border border-primary/20 mb-4 group-hover:scale-110 transition-transform duration-500 shadow-inner"
                        >
                            <img
                                src="https://img.icons8.com/isometric/100/bee.png"
                                alt="Logo"
                                className="w-14 h-14 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                            />
                        </motion.div>
                        <h1 className="text-5xl font-black italic tracking-tighter leading-none text-white">
                            BEE<span className="text-primary">SYSTEM</span>
                        </h1>
                        <p className="text-[10px] uppercase font-black tracking-[0.4em] text-muted-foreground opacity-60">
                            Gestão Logística Enterprise v1.0
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative group/input">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within/input:text-primary transition-colors duration-300" />
                                <input
                                    type="email"
                                    placeholder="E-MAIL CORPORATIVO"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-3xl py-5 pl-16 pr-6 text-xs font-black tracking-widest uppercase focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all duration-300 placeholder:text-muted-foreground/30"
                                />
                            </div>

                            <div className="relative group/input">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within/input:text-primary transition-colors duration-300" />
                                <input
                                    type="password"
                                    placeholder="SENHA DE ACESSO"
                                    required
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-3xl py-5 pl-16 pr-6 text-xs font-black tracking-widest uppercase focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all duration-300 placeholder:text-muted-foreground/30"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-2">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="w-5 h-5 rounded-md border border-white/10 flex items-center justify-center transition-all group-hover:border-primary/50">
                                    <input type="checkbox" className="hidden peer" />
                                    <div className="w-2 h-2 rounded-full bg-primary opacity-0 peer-checked:opacity-100 transition-opacity" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-white transition-colors">Lembrar</span>
                            </label>
                            <button type="button" className="text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors">Recuperar Senha</button>
                        </div>

                        <button
                            type="submit"
                            disabled={carregando}
                            className="w-full relative group h-16 rounded-3xl overflow-hidden shadow-2xl transition-all active:scale-[0.98]"
                        >
                            <div className="absolute inset-0 bg-primary group-hover:bg-amber-500 transition-colors duration-300" />
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-[radial-gradient(circle_at_center,_white_0%,_transparent_100%)]" />

                            <div className="relative flex items-center justify-center gap-3 text-background font-black text-xs uppercase tracking-[0.2em]">
                                {carregando ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Acessar Colmeia
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </div>
                        </button>
                    </form>

                    <div className="pt-4 space-y-4">
                        <p className="text-[10px] text-center font-black uppercase tracking-widest text-muted-foreground opacity-30">Contas Sugeridas</p>
                        <div className="flex flex-wrap justify-center gap-3">
                            {[
                                { label: 'Admin', icon: Sparkles, color: 'text-primary' },
                                { label: 'Gerente', icon: ShieldCheck, color: 'text-blue-400' },
                                { label: 'Vendedor', icon: ChevronRight, color: 'text-green-400' }
                            ].map((account) => (
                                <button
                                    key={account.label}
                                    type="button"
                                    onClick={() => setEmail(account.label.toLowerCase() + '@beesystem.com')}
                                    className="px-4 py-2 rounded-xl glass border border-white/5 hover:border-white/20 transition-all flex items-center gap-2 group"
                                >
                                    <account.icon className={`w-3 h-3 ${account.color} group-hover:scale-125 transition-transform`} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">{account.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex items-center justify-center gap-8 opacity-40">
                    <img src="https://img.icons8.com/ios-filled/50/ffffff/safe-ok.png" alt="Safe" className="w-5 h-5 grayscale" />
                    <img src="https://img.icons8.com/ios-filled/50/ffffff/certificate.png" alt="SSL" className="w-5 h-5 grayscale" />
                    <img src="https://img.icons8.com/ios-filled/50/ffffff/security-checked.png" alt="Secure" className="w-5 h-5 grayscale" />
                </div>
            </motion.div>
        </div>
    );
}
