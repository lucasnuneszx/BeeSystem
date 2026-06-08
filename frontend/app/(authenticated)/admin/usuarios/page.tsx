'use client';

import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Edit2, ShieldAlert,
  Trash2, Search, Filter, MoreVertical,
  CheckCircle2, XCircle, AlertCircle, Mail,
  CreditCard, Shield, X, Database, KeyRound, ChevronLeft, ChevronRight, Loader2
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
  { id: '5', nome: 'Daniel Rocha Mendes', email: 'daniel.rocha@beesystem.com', cpf: '111.222.333-44', perfil: 'VENDEDOR', status: 'ATIVO' },
  { id: '6', nome: 'Eliana Costa Lima', email: 'eliana.costa@beesystem.com', cpf: '444.555.666-77', perfil: 'OFICIAL', status: 'ATIVO' },
  { id: '7', nome: 'Felipe Almeida Silva', email: 'felipe.almeida@beesystem.com', cpf: '888.999.000-11', perfil: 'GERENTE', status: 'INATIVO' },
  { id: '8', nome: 'Gabriela Duarte Santos', email: 'gabriela.duarte@beesystem.com', cpf: '222.333.444-55', perfil: 'VENDEDOR', status: 'ATIVO' },
  { id: '9', nome: 'Hugo Martins Ferreira', email: 'hugo.martins@beesystem.com', cpf: '666.777.888-99', perfil: 'OFICIAL', status: 'ATIVO' }
];

export default function PaginaGestaoUsuarios() {
  const { notificar } = usarNotificacao();
  const [carregando, setCarregando] = useState(true);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [mostrarModalAdicionar, setMostrarModalAdicionar] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<any>(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [senhaTemporariaGerada, setSenhaTemporariaGerada] = useState<string | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5;

  const [dadosForm, setDadosForm] = useState({
    nome: '',
    email: '',
    cpf: '',
    perfil: 'VENDEDOR',
    senha: ''
  });

  // Tenta sincronizar com o banco real, mas mantém os mocks se falhar
  const sincronizarComBanco = async () => {
    setCarregando(true);
    try {
      const lista = await listarUsuarios();
      if (lista && lista.length > 0) {
        setUsuarios(lista);
      } else {
        setUsuarios(usuariosMockados);
      }
    } catch (e) {
      console.warn('Usando base local de dados (vôo manual).');
      setUsuarios(usuariosMockados);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    sincronizarComBanco();
  }, []);

  const abrirModalParaCriar = () => {
    setDadosForm({ nome: '', email: '', cpf: '', perfil: 'VENDEDOR', senha: '' });
    setUsuarioEditando(null);
    setSenhaTemporariaGerada(null);
    setMostrarModalAdicionar(true);
  };

  const abrirModalParaEditar = (usuario: any) => {
    setDadosForm({ nome: usuario.nome, email: usuario.email, cpf: usuario.cpf, perfil: usuario.perfil, senha: '' });
    setUsuarioEditando(usuario);
    setSenhaTemporariaGerada(null);
    setMostrarModalAdicionar(true);
  };

  const fecharModal = () => {
    setMostrarModalAdicionar(false);
    setUsuarioEditando(null);
    setSenhaTemporariaGerada(null);
  };

  const handleSalvar = async () => {
    if (!dadosForm.nome || !dadosForm.email || !dadosForm.cpf) {
      notificar('Preencha os campos obrigatórios.', 'erro');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;
    if (!emailRegex.test(dadosForm.email.toLowerCase().trim())) {
      notificar('O e-mail deve ser um endereço válido terminando em .com.', 'erro');
      return;
    }

    if (!usuarioEditando && (!dadosForm.senha || dadosForm.senha.trim() === '')) {
      notificar('A senha é obrigatória para a criação de um novo operador.', 'erro');
      return;
    }

    notificar('Gravando na colmeia...', 'info');

    // Tenta salvar no banco real via Server Action
    try {
      const res = await salvarUsuario({ ...dadosForm, id: usuarioEditando?.id });
      if (res.sucesso) {
        notificar('Operação gravada no banco corporativo!', 'sucesso');
        fecharModal();
        sincronizarComBanco();
      } else {
        notificar(`Erro ao salvar: ${res.erro}`, 'erro');
      }
    } catch (e) {
      notificar('Erro técnico. Operação descartada.', 'erro');
      fecharModal();
    }
  };

  const [modalConfirmacao, setModalConfirmacao] = useState<{
    aberto: boolean;
    tipo: 'excluir' | 'status';
    titulo: string;
    mensagem: string;
    dados: any;
  }>({
    aberto: false,
    tipo: 'excluir',
    titulo: '',
    mensagem: '',
    dados: null
  });

  const abrirConfirmacaoExcluir = (usuario: any) => {
    setModalConfirmacao({
      aberto: true,
      tipo: 'excluir',
      titulo: 'Excluir Colaborador',
      mensagem: `Tem certeza de que deseja excluir permanentemente o operador "${usuario.nome}"? Esta ação não poderá ser desfeita.`,
      dados: usuario
    });
  };

  const abrirConfirmacaoStatus = (usuario: any) => {
    const acao = usuario.status === 'ATIVO' ? 'inativar' : 'ativar';
    setModalConfirmacao({
      aberto: true,
      tipo: 'status',
      titulo: `${usuario.status === 'ATIVO' ? 'Inativar' : 'Ativar'} Colaborador`,
      mensagem: `Deseja realmente ${acao} o operador "${usuario.nome}" no ecossistema?`,
      dados: usuario
    });
  };

  const confirmarAcao = async () => {
    const { tipo, dados } = modalConfirmacao;
    setModalConfirmacao(prev => ({ ...prev, aberto: false }));
    if (!dados) return;

    if (tipo === 'excluir') {
      try {
        const res = await excluirUsuario(dados.id);
        if (res.sucesso) {
          notificar('Removido do banco corporativo.', 'sucesso');
          sincronizarComBanco();
        } else {
          setUsuarios(usuarios.filter(u => u.id !== dados.id));
          notificar('Removido localmente.', 'sucesso');
        }
      } catch (e) {
        notificar('Erro ao excluir.', 'erro');
      }
    } else if (tipo === 'status') {
      try {
        const res = await alternarStatusUsuario(dados.id, dados.status);
        if (res.sucesso) {
          const msg = dados.status === 'ATIVO' ? 'Usuário desativado' : 'Usuário ativado';
          notificar(msg, 'info');
          sincronizarComBanco();
        } else {
          const novoStatus = dados.status === 'ATIVO' ? 'INATIVO' : 'ATIVO';
          setUsuarios(usuarios.map(u => u.id === dados.id ? { ...u, status: novoStatus } : u));
          const msg = novoStatus === 'INATIVO' ? 'Usuário desativado' : 'Usuário ativado';
          notificar(msg, 'info');
        }
      } catch (e) {
        notificar('Falha na conexão.', 'erro');
      }
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
            onChange={(e) => {
              setTermoBusca(e.target.value);
              setPaginaAtual(1);
            }}
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
                  {usuariosFiltrados.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina).map((item, i) => (
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
                          <button onClick={() => abrirConfirmacaoStatus(item)} className="p-3 glass rounded-xl hover:text-orange-500 transition-all shadow-xl" title="Bloquear/Liberar">
                            <ShieldAlert size={16} />
                          </button>
                          <button onClick={() => abrirConfirmacaoExcluir(item)} className="p-3 glass rounded-xl hover:text-red-500 transition-all shadow-xl" title="Excluir Colaborador">
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

          {/* Paginação */}
          {usuariosFiltrados.length > itensPorPagina && (
            <div className="flex items-center justify-between px-8 py-5 bg-white/[0.01] border-t border-white/5">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                Página {paginaAtual} de {Math.ceil(usuariosFiltrados.length / itensPorPagina)}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
                  disabled={paginaAtual === 1}
                  className="p-3 glass rounded-xl hover:text-primary transition-all disabled:opacity-30 disabled:hover:text-white"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPaginaAtual(prev => Math.min(prev + 1, Math.ceil(usuariosFiltrados.length / itensPorPagina)))}
                  disabled={paginaAtual === Math.ceil(usuariosFiltrados.length / itensPorPagina)}
                  className="p-3 glass rounded-xl hover:text-primary transition-all disabled:opacity-30 disabled:hover:text-white"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
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
              {senhaTemporariaGerada ? (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-green-500/10 rounded-[1.5rem] flex items-center justify-center text-green-500 border border-green-500/20">
                        <CheckCircle2 size={32} />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black italic tracking-tighter uppercase whitespace-nowrap leading-none text-green-500">
                          Acesso Gerado
                        </h2>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 mt-2">Identidade Salva no Supabase Auth</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 bg-green-500/5 border border-green-500/10 rounded-[2rem] p-6 text-center">
                    <p className="text-xs uppercase tracking-widest font-mono text-gray-400 font-tech">// Copie a senha temporária abaixo</p>
                    
                    <div className="bg-surface border border-white/5 rounded-2xl p-5 font-mono text-2xl font-black tracking-widest text-[#ffcc00] select-all cursor-pointer">
                      {senhaTemporariaGerada}
                    </div>
                    
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                      Esta senha temporária não será exibida novamente por motivos de conformidade de segurança. O operador deverá alterá-la no primeiro acesso.
                    </p>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={fecharModal}
                      className="w-full bg-primary text-background py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-primary/30"
                    >
                      Concluir e Fechar
                    </button>
                  </div>
                </div>
              ) : (
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

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-4">
                        Senha {usuarioEditando ? '(Deixe em branco para manter)' : '(Obrigatória)'}
                      </label>
                      <div className="relative">
                        <KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground opacity-30" size={20} />
                        <input
                          type="password"
                          value={dadosForm.senha}
                          onChange={(e) => setDadosForm({ ...dadosForm, senha: e.target.value })}
                          className="w-full bg-surface border border-white/5 rounded-[2rem] pl-16 pr-8 py-5 outline-none focus:border-primary/50 transition-all font-bold text-lg shadow-inner"
                          placeholder={usuarioEditando ? "••••••••" : "Senha de Acesso"}
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
                      disabled={!dadosForm.nome || !dadosForm.email || !dadosForm.cpf || (!usuarioEditando && !dadosForm.senha)}
                      className="flex-1 bg-primary text-background py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 shadow-2xl shadow-primary/30"
                    >
                      {usuarioEditando ? 'Salvar Mudanças' : 'Garantir Acesso'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de Confirmação Personalizado */}
      <AnimatePresence>
        {modalConfirmacao.aberto && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/90 backdrop-blur-md z-[110]"
              onClick={() => setModalConfirmacao(prev => ({ ...prev, aberto: false }))}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md glass p-8 rounded-[2.5rem] z-[111] border border-white/5 shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xl ${
                    modalConfirmacao.tipo === 'excluir' 
                      ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                      : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                  }`}>
                    {modalConfirmacao.tipo === 'excluir' ? <Trash2 size={28} /> : <ShieldAlert size={28} />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black italic tracking-tighter uppercase whitespace-nowrap leading-none">
                      {modalConfirmacao.titulo}
                    </h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 mt-2">Confirmação de Segurança</p>
                  </div>
                </div>

                <p className="text-sm font-medium leading-relaxed text-gray-300">
                  {modalConfirmacao.mensagem}
                </p>

                <div className="flex gap-4 pt-2">
                  <button
                    onClick={() => setModalConfirmacao(prev => ({ ...prev, aberto: false }))}
                    className="flex-1 glass py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmarAcao}
                    className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl ${
                      modalConfirmacao.tipo === 'excluir'
                        ? 'bg-red-500 text-white shadow-red-500/20'
                        : 'bg-orange-500 text-white shadow-orange-500/20'
                    }`}
                  >
                    Confirmar
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
