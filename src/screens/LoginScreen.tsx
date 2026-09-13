import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { APP_IMAGES, DEFAULT_USERS } from '../data/mockData';
import LogoImage from '../components/LogoImage';
import { signUp, signIn, authErrorMessage } from '../lib/auth';

interface LoginScreenProps {
  onLogin: (user: UserProfile) => void;
}

type AuthMode = 'entrar' | 'criar';

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [role, setRole] = useState<UserRole>('aluno');
  const [mode, setMode] = useState<AuthMode>('entrar');

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [extra, setExtra] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const extraLabel = role === 'aluno' ? 'Número de Matrícula' : 'Disciplina / Sala';

  const buildInput = () => {
    const trimmedName = name.trim();
    if (role === 'aluno') {
      return {
        role: 'aluno' as UserRole,
        name: trimmedName,
        email,
        password,
        details: `Matrícula: ${extra.trim() || 'informar depois'}`,
        classGroup: '3º Ano A'
      };
    }
    const subject = extra.trim() || 'Matemática';
    return {
      role: 'professor' as UserRole,
      name: trimmedName.startsWith('Prof') ? trimmedName : `Prof. ${trimmedName}`,
      email,
      password,
      details: `${subject} • Sala 04-B`,
      subject,
      room: 'Sala 04-B',
      classGroup: '3º Ano A'
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Informe e-mail e senha.');
      return;
    }
    if (mode === 'criar') {
      if (!name.trim()) {
        setError('Informe seu nome para criar a conta.');
        return;
      }
      if (password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.');
        return;
      }
    }
    setLoading(true);
    try {
      const profile =
        mode === 'criar' ? await signUp(buildInput()) : await signIn(email, password);
      onLogin(profile);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const switchRole = (next: UserRole) => {
    setRole(next);
    setError('');
  };

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError('');
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Decorative background ambient shapes */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#e2dfff] opacity-40 blur-3xl pointer-events-none animate-blob"></div>
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#eff4ff] opacity-60 blur-3xl pointer-events-none animate-blob animate-blob-delay"></div>
      <div className="absolute top-1/3 -left-20 w-72 h-72 rounded-full bg-[#6ffbbe]/20 opacity-50 blur-3xl pointer-events-none animate-blob"></div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-[0_24px_70px_-24px_rgba(58,52,211,0.25)] border border-white/70 ring-1 ring-[#e5eeff]/80 relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-white border border-[#dce9ff] flex items-center justify-center p-2.5 shadow-[0_8px_20px_-8px_rgba(58,52,211,0.4)] ring-1 ring-[#e2dfff]">
            <LogoImage
              variant="color"
              alt="+Foco Logo"
              className="h-14 w-auto object-contain"
            />
          </div>
          <div>
            <h1 className="text-[26px] font-extrabold tracking-tight">
              Portal <span className="text-gradient-primary">+Foco</span>
            </h1>
            <p className="text-[13px] text-[#464555]">
              Rotina Escolar, Modo Aula e Co-estudo Conectado
            </p>
          </div>
        </div>

        {/* Auth Mode Toggle (Entrar | Criar conta) */}
        <div className="p-1 bg-[#0b1c30]/80 rounded-2xl flex items-center gap-1 shadow-inner">
          <button
            type="button"
            onClick={() => switchMode('entrar')}
            className={`flex-1 py-2 px-3 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center gap-2 ${
              mode === 'entrar'
                ? 'bg-white text-[#3a34d3] shadow-[0_4px_14px_-4px_rgba(58,52,211,0.5)]'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">login</span>
            <span>Entrar</span>
          </button>
          <button
            type="button"
            onClick={() => switchMode('criar')}
            className={`flex-1 py-2 px-3 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center gap-2 ${
              mode === 'criar'
                ? 'bg-white text-[#3a34d3] shadow-[0_4px_14px_-4px_rgba(58,52,211,0.5)]'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Criar conta</span>
          </button>
        </div>

        {/* Role Toggle Selector (Aluno vs Professor) */}
        <div className="p-1 bg-[#eff4ff]/70 rounded-2xl flex items-center gap-1 border border-[#dce9ff]/80 shadow-inner">
          <button
            type="button"
            onClick={() => switchRole('aluno')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center gap-2 ${
              role === 'aluno'
                ? 'bg-white text-[#3a34d3] shadow-[0_4px_14px_-4px_rgba(58,52,211,0.35)] ring-1 ring-[#e2dfff]'
                : 'text-[#464555] hover:text-[#0b1c30]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">school</span>
            <span>Sou Aluno</span>
          </button>

          <button
            type="button"
            onClick={() => switchRole('professor')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center gap-2 ${
              role === 'professor'
                ? 'bg-[#3a34d3] text-white shadow-[0_6px_18px_-6px_rgba(58,52,211,0.6)] ring-1 ring-[#c1c1ff]'
                : 'text-[#464555] hover:text-[#0b1c30]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">cast_for_education</span>
            <span>Sou Professor</span>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-[#fdecea] border border-[#ffc9c3] text-[#b22200] text-[12.5px] animate-in fade-in slide-in-from-top-3 duration-300">
            <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'criar' && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-[#464555] uppercase tracking-wider mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={
                    role === 'aluno' ? 'Ex: Pedro Henrique' : 'Ex: Ana Beatriz'
                  }
                  className="w-full text-[13px] px-3 py-2.5 bg-[#f8f9ff] rounded-xl border border-[#e5eeff] focus:outline-none focus:border-[#3a34d3]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#464555] uppercase tracking-wider mb-1">
                  {extraLabel}
                </label>
                <input
                  type="text"
                  value={extra}
                  onChange={(e) => setExtra(e.target.value)}
                  placeholder={role === 'aluno' ? 'Ex: 2024-9122' : 'Ex: Química • Laboratório 3'}
                  className="w-full text-[13px] px-3 py-2.5 bg-[#f8f9ff] rounded-xl border border-[#e5eeff] focus:outline-none focus:border-[#3a34d3]"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-bold text-[#464555] uppercase tracking-wider mb-1">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@escola.edu.br"
              className="w-full text-[13px] px-3 py-2.5 bg-[#f8f9ff] rounded-xl border border-[#e5eeff] focus:outline-none focus:border-[#3a34d3]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#464555] uppercase tracking-wider mb-1">
              {role === 'professor' ? 'Chave de Acesso Docente' : 'Senha'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-[13px] px-3 py-2.5 bg-[#f8f9ff] rounded-xl border border-[#e5eeff] focus:outline-none focus:border-[#3a34d3]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-[#777587] hover:text-[#0b1c30]"
                aria-label="Mostrar ou ocultar senha"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {mode === 'criar' && (
            <p className="text-[11px] text-[#777587] -mt-1">
              A conta é criada com e-mail e senha no Firebase. Sua senha nunca fica
              salva no aplicativo.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-[14px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all ${
              role === 'professor'
                ? 'bg-[#0b1c30] hover:bg-[#1b2b40] shadow-md'
                : 'bg-[#3a34d3] hover:bg-[#5452ec] shadow-[0_4px_16px_rgba(58,52,211,0.25)]'
            } disabled:opacity-60 disabled:active:scale-100`}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin"></span>
                <span>{mode === 'criar' ? 'Criando conta...' : 'Entrando...'}</span>
              </>
            ) : (
              <>
                <span>{mode === 'criar' ? 'Criar conta e entrar' : `Entrar como ${role === 'aluno' ? 'Aluno' : 'Professor'}`}</span>
                <span className="material-symbols-outlined text-[18px]">
                  {mode === 'criar' ? 'how_to_reg' : 'login'}
                </span>
              </>
            )}
          </button>

          <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] text-[#464555]">
            <div className="flex items-center gap-1.5 p-2 bg-[#eff4ff] rounded-xl">
              <span className="material-symbols-outlined text-[16px] text-[#005d3e]">timer</span>
              <span>Modo Foco Ativo</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 bg-[#eff4ff] rounded-xl">
              <span className="material-symbols-outlined text-[16px] text-[#3a34d3]">front_hand</span>
              <span>Dúvida Discreta</span>
            </div>
          </div>
        </form>

        {/* Quick Demo Footer Action */}
        <div className="pt-2 border-t border-[#e5eeff] flex flex-col items-center gap-2 text-center">
          <span className="text-[11px] text-[#777587]">
            Ambiente Demonstrativo Integrado
          </span>
          <div className="flex items-center gap-2 w-full">
            <button
              type="button"
              onClick={() => onLogin(DEFAULT_USERS.students[0])}
              className="flex-1 py-2 px-2.5 rounded-lg bg-[#e5eeff] hover:bg-[#dce9ff] text-[#3a34d3] text-[11px] font-bold truncate transition-colors"
            >
              Entrar como Lucas (Aluno)
            </button>
            <button
              type="button"
              onClick={() => onLogin(DEFAULT_USERS.teachers[0])}
              className="flex-1 py-2 px-2.5 rounded-lg bg-[#e2dfff] hover:bg-[#d4d0fc] text-[#0b1c30] text-[11px] font-bold truncate transition-colors"
            >
              Entrar como Ricardo (Prof)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};