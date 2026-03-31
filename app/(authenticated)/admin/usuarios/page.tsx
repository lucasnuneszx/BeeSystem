'use client';

import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Edit2, ShieldAlert,
  Trash2, Search, Filter, MoreVertical,
  CheckCircle2, XCircle, AlertCircle, Mail,
  CreditCard, Shield, X, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usarNotificacao } from '@/context/NotificacaoContext';
import {
  listarUsuarios,
  salvarUsuario,
  alternarStatusUsuario,
  excluirUsuario
} from '@/app/actions/usuarios';

// Dados Mokados para População Imediata (RF Urgência)
const usuariosMockados = [
  { id: '1', nome: 'Ana Maria Ferreira', email: 'ana.ferreira@beesystem.com', cpf: '123.456.789-00', perfil: 'GERENTE', status: 'ATIVO' },
  { id: '2', nome: 'Lucas Oliveira Santos', email: 'lucas.oliveira@beesystem.com', cpf: '987.654.321-11', perfil: 'VENDEDOR', status: 'ATIVO' },
  { id: '3', nome: 'Beatriz Silva Lima', email: 'beatriz.lima@beesystem.com', cpf: '555.444.333-22', perfil: 'VENDEDOR', status: 'ATIVO' },
  { id: '4', nome: 'Carlos Eduardo Souza', email: 'carlos.souza@beesystem.com', cpf: '777.888.999-33', perfil: 'OFICIAL', status: 'ATIVO' },
];

export default function PaginaGestaoUsuarios() {
  const { notificar } = usarNotificacao();
  const [carregando, setCarregando] = useState(false);
  const [usuarios, setUsuarios] = useState(usuariosMockados);
  const [mostrarModalAdicionar, setMostrarModalAdicionar] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<any>(null);
  const [termoBusca, setTermoBusca] = useState('');

  const [dadosForm, setDadosForm] = useState({
    nome: '',
    email: '',
    cpf: '',
    perfil: 'VENDEDOR'
  });

  // Tenta sincronizar com o banco real, mas mantém os mocks se falhar
  const sincronizarComBanco = async () => {
    setCarregando(true);
    try {
      const lista = await listarUsuarios();
      if (lista && lista.length > 0) {
        setUsuarios(lista);
      }
    } catch (e) {
      console.warn('Usando base local de dados (vôo manual).');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    sincronizarComBanco();
  }, []);

  const abrirModalParaCriar = () => {
    setDadosForm({ nome: '', email: '', cpf: '', perfil: 'VENDEDOR' });
    setUsuarioEditando(null);
    setMostrarModalAdicionar(true);
  };

  const abrirModalParaEditar = (usuario: any) => {
    setDadosForm({ nome: usuario.nome, email: usuario.email, cpf: usuario.cpf, perfil: usuario.perfil });
    setUsuarioEditando(usuario);
    setMostrarModalAdicionar(true);
  };

  const fecharModal = () => {
    setMostrarModalAdicionar(false);
    setUsuarioEditando(null);
  };

  const handleSalvar = async () => {
    if (!dadosForm.nome || !dadosForm.email || !dadosForm.cpf) {
      notificar('Preencha os campos obrigatórios.', 'erro');
      return;
    }

    notificar('Gravando na colmeia...', 'info');

    // Tenta salvar no banco real via Server Action
    try {
      const res = await salvarUsuario({ ...dadosForm, id: usuarioEditando?.id });
      if (res.sucesso) {
        notificar('Operação gravada no banco corporativo!', 'sucesso');
        sincronizarComBanco();
      } else {
        // Se falhar no banco, salva no estado local (mock reactivo) para não travar o usuário
        if (usuarioEditando) {
          setUsuarios(usuarios.map(u => u.id === usuarioEditando.id ? { ...u, ...dadosForm } : u));
        } else {
          const novo = { ...dadosForm, id: Math.random().toString(36).substr(2, 9), status: 'ATIVO' };
          setUsuarios([novo, ...usuarios]);
        }
        notificar('Operação concluída localmente (Banco Offline).', 'info');
      }
    } catch (e) {
      notificar('Erro técnico. Operação descartada.', 'erro');
    }

    fecharModal();
  };

  const handleAlternarStatus = async (usuario: any) => {
    try {
      const res = await alternarStatusUsuario(usuario.id, usuario.status);
      if (res.sucesso) {
        notificar('Status operacional alterado no banco.', 'info');
        sincronizarComBanco();
      } else {
        setUsuarios(usuarios.map(u => u.id === usuario.id ? { ...u, status: u.status === 'ATIVO' ? 'INATIVO' : 'ATIVO' } : u));
        notificar('Status alterado localmente.', 'info');
      }
    } catch (e) {
      notificar('Falha na conexão.', 'erro');
    }
  };

  const handleExcluir = async (id: string) => {
    if (!confirm('Excluir este operador permanentemente?')) return;
    try {
      const res = await excluirUsuario(id);
      if (res.sucesso) {
        notificar('Removido do banco corporativo.', 'sucesso');
        sincronizarComBanco();
      } else {
        setUsuarios(usuarios.filter(u => u.id !== id));
        notificar('Removido localmente.', 'sucesso');
      }
    } catch (e) {
      notificar('Erro ao excluir.', 'erro');
    }
  };

  const usuariosFiltrados = (usuarios || []).filter(u =>
    u.nome?.toLowerCase().includes(termoBusca.toLowerCase()) ||
    u.email?.toLowerCase().includes(termoBusca.toLowerCase()) ||
    u.cpf?.includes(termoBusca)
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3 italic leading-none">
            <Users size={36} className="text-primary" /> GESTÃO DE USUÁRIOS
          </h1>
          <p className="text-muted-foreground italic uppercase text-xs tracking-widest opacity-60 mt-1">Sincronizado com Ecossistema BeeSystem</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={sincronizarComBanco}
            className="glass px-6 py-4 rounded-[2rem] border border-primary/20 text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-primary hover:text-background transition-all"
          >
            <Database size={18} className={carregando ? 'animate-spin' : ''} />
            Atualizar Lista
          </button>
          <button
            onClick={abrirModalParaCriar}
            className="bg-primary text-background px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-primary/20"
          >
            <UserPlus size={20} /> NOVO USUÁRIO
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou CPF..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full bg-surface border border-white/5 rounded-xl pl-12 pr-4 py-4 outline-none focus:border-primary/50 transition-all font-medium shadow-inner"
          />
        </div>
      </div>

      <div className="glass rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface/50 border-b border-white/5">
                <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-muted-foreground">Operador</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-muted-foreground">CPF</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-muted-foreground">Perfil</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {carregando && usuarios.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`}>
                    <td className="px-8 py-8"><div className="w-48 h-10 skeleton rounded-xl" /></td>
                    <td className="px-8 py-8"><div className="w-24 h-6 skeleton rounded-lg" /></td>
                    <td className="px-8 py-8"><div className="w-20 h-6 skeleton rounded-full" /></td>
                    <td className="px-8 py-8"><div className="w-16 h-4 skeleton rounded-full" /></td>
                    <td className="px-8 py-8 text-right"><div className="w-20 h-10 skeleton rounded-xl ml-auto" /></td>
                  </tr>
                ))
              ) : (
                <AnimatePresence mode="popLayout">
                  {usuariosFiltrados.map((item, i) => (
                    <motion.tr
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary/10 to-transparent flex items-center justify-center font-bold text-primary border border-primary/20 shadow-xl group-hover:scale-105 transition-transform">
                            {item.nome.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-lg leading-tight">{item.nome}</p>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1">{item.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8 font-mono text-sm tracking-tighter opacity-80">{item.cpf}</td>
                      <td className="px-8 py-8">
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${item.perfil === 'ADMIN' ? 'bg-primary/10 text-primary border-primary/20' :
                            item.perfil === 'GERENTE' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                              item.perfil === 'VENDEDOR' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                'bg-orange-500/10 text-orange-400 border-orange-500/20'
                          }`}>
                          {item.perfil}
                        </span>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-2">
                          {item.status === 'ATIVO' ? (
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-red-500 opacity-50 truncate" />
                          )}
                          <span className={`text-[10px] font-black uppercase tracking-widest ${item.status === 'ATIVO' ? 'text-green-500' : 'text-red-500'}`}>
                            {item.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-8 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => abrirModalParaEditar(item)} className="p-3 glass rounded-xl hover:text-primary transition-all shadow-xl" title="Editar Dados">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleAlternarStatus(item)} className="p-3 glass rounded-xl hover:text-orange-500 transition-all shadow-xl" title="Bloquear/Liberar">
                            <ShieldAlert size={16} />
                          </button>
                          <button onClick={() => handleExcluir(item.id)} className="p-3 glass rounded-xl hover:text-red-500 transition-all shadow-xl" title="Excluir Colaborador">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {mostrarModalAdicionar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/90 backdrop-blur-md z-[100]"
              onClick={fecharModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg glass p-10 rounded-[3rem] z-[101] border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.5)]"
            >
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center text-primary border border-primary/20">
                      {usuarioEditando ? <Edit2 size={32} /> : <UserPlus size={32} />}
                    </div>
                    <div>
                      <h2 className="text-3xl font-black italic tracking-tighter uppercase whitespace-nowrap leading-none">
                        {usuarioEditando ? 'Dados Operador' : 'Novo Operador'}
                      </h2>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 mt-2">Gestão de Identidade BEESYSTEM</p>
                    </div>
                  </div>
                  <button onClick={fecharModal} className="p-3 glass rounded-2xl hover:text-red-500 transition-all"><X size={24} /></button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-4">Nome Completo</label>
                    <div className="relative">
                      <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground opacity-30" size={20} />
                      <input
                        type="text"
                        value={dadosForm.nome}
                        onChange={(e) => setDadosForm({ ...dadosForm, nome: e.target.value })}
                        className="w-full bg-surface border border-white/5 rounded-[2rem] pl-16 pr-8 py-5 outline-none focus:border-primary/50 transition-all font-bold text-lg shadow-inner"
                        placeholder="Nome do Colaborador"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-4">E-mail Corporativo</label>
                    <div className="relative">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground opacity-30" size={20} />
                      <input
                        type="email"
                        value={dadosForm.email}
                        onChange={(e) => setDadosForm({ ...dadosForm, email: e.target.value })}
                        className="w-full bg-surface border border-white/5 rounded-[2rem] pl-16 pr-8 py-5 outline-none focus:border-primary/50 transition-all font-bold text-lg shadow-inner"
                        placeholder="colaborador@beesystem.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-4">Documento CPF</label>
                      <input
                        type="text"
                        value={dadosForm.cpf}
                        onChange={(e) => setDadosForm({ ...dadosForm, cpf: e.target.value })}
                        className="w-full bg-surface border border-white/5 rounded-[2rem] px-8 py-5 outline-none focus:border-primary/50 transition-all font-mono font-bold text-lg shadow-inner"
                        placeholder="000.000.000-00"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-4">Perfil Funcional</label>
                      <select
                        value={dadosForm.perfil}
                        onChange={(e) => setDadosForm({ ...dadosForm, perfil: e.target.value as any })}
                        className="w-full bg-surface border border-white/5 rounded-[2rem] px-8 py-5 outline-none focus:border-primary/50 transition-all font-black text-[10px] uppercase tracking-widest cursor-pointer shadow-inner appearance-none"
                      >
                        <option value="VENDEDOR">VENDEDOR</option>
                        <option value="GERENTE">GERENTE</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="OFICIAL">OFICIAL</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={fecharModal}
                    className="flex-1 glass py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-surface transition-all"
                  >
                    Abortar
                  </button>
                  <button
                    onClick={handleSalvar}
                    disabled={!dadosForm.nome || !dadosForm.email || !dadosForm.cpf}
                    className="flex-1 bg-primary text-background py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 shadow-2xl shadow-primary/30"
                  >
                    {usuarioEditando ? 'Salvar Mudanças' : 'Garantir Acesso'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
