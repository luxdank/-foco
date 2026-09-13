import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { DEFAULT_USERS } from '../data/mockData';
import LogoImage from '../components/LogoImage';

interface LoginScreenProps {
  onLogin: (user: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const recentRole = () =>
    localStorage.getItem('foco:lastRole') === 'professor' ? 'professor' : 'aluno';
  const [role, setRole] = useState<UserRole>(recentRole);

  const isAluno = role === 'aluno';
  const demoUser = isAluno ? DEFAULT_USERS.students[0] : DEFAULT_USERS.teachers[0];

  const handleEnter = () => {
    try {
      localStorage.setItem('foco:lastRole', role);
    } catch {
      // armazenamento indisponível — ignora
    }
    onLogin(demoUser);
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Decorative background ambient shapes */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#e2dfff] opacity-40 blur-3xl pointer-events-none animate-blob"></div>
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#eff4ff] opacity-60 blur-3xl pointer-events-none animate-blob animate-blob-delay"></div>
      <div className="absolute top-1/3 -left-20 w-72 h-72 rounded-full bg-[#6ffbbe]/20 opacity-50 blur-3xl pointer-events-none animate-blob"></div>

      <div className="w-full max-w-md cartoon-card bg-white/90 backdrop-blur-xl p-6 sm:p-8 border-[#e2dfff] relative z-10 space-y-6 animate-pop-in">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-white border-2 border-[#dce9ff] flex items-center justify-center p-2 shadow-[0_10px_24px_-8px_rgba(58,52,211,0.45)] ring-1 ring-[#e2dfff] animate-float-soft">
              <LogoImage
                variant="color"
                alt="+Foco Logo"
                className="h-14 w-auto object-contain"
              />
            </div>
            <span className="absolute -top-2 -right-3 text-[22px] animate-wiggle select-none" role="img" aria-label="mascote de foco">
              🧠
            </span>
          </div>
          <div>
            <h1 className="text-[28px] font-extrabold tracking-tight font-display">
              Portal <span className="text-gradient-primary">+Foco</span>
            </h1>
            <p className="text-[13px] text-[#464555]">
              Rotina Escolar, Modo Aula e Co-estudo Conectado
            </p>
          </div>
        </div>

        {/* Quem é você? */}
        <div className="flex flex-col items-center text-center space-y-1">
          <p className="text-[12px] font-bold text-[#777587] uppercase tracking-wider">
            Quem é você?
          </p>
          <p className="text-[11px] text-[#464555] -mt-1">
            Entre com um perfil de demonstração — professor ou aluno.
          </p>
        </div>

        {/* Role Toggle Selector (Aluno vs Professor) */}
        <div className="p-1.5 bg-[#eff4ff]/80 rounded-2xl flex items-center gap-1.5 border-2 border-[#dce9ff] shadow-inner">
          <button
            type="button"
            onClick={() => setRole('aluno')}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-[13px] font-bold transition-all flex items-center justify-center gap-2 ${
              role === 'aluno'
                ? 'bg-white text-[#3a34d3] shadow-[0_5px_16px_-4px_rgba(58,52,211,0.4)] ring-2 ring-[#c1c1ff]'
                : 'text-[#464555] hover:text-[#0b1c30]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">school</span>
            <span>Sou Aluno</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('professor')}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-[13px] font-bold transition-all flex items-center justify-center gap-2 ${
              role === 'professor'
                ? 'cartoon-btn bg-[#3a34d3] text-white ring-2 ring-[#c1c1ff]'
                : 'text-[#464555] hover:text-[#0b1c30]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">cast_for_education</span>
            <span>Sou Professor</span>
          </button>
        </div>

        {/* Login Automático por papel (sem formulário) */}
        <div className="space-y-2">
          {isAluno ? (
            <button
              type="button"
              onClick={handleEnter}
              className="w-full py-4 px-4 cartoon-btn bg-[#3a34d3] hover:bg-[#5452ec] text-white font-bold text-[14px] flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">school</span>
              <span>Entrar como Lucas (Aluno)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleEnter}
              className="w-full py-4 px-4 cartoon-btn bg-[#0b1c30] hover:bg-[#1b2b40] text-white font-bold text-[14px] flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">cast_for_education</span>
              <span>Entrar como Ricardo (Prof)</span>
            </button>
          )}
          <p className="text-[11px] text-[#777587] text-center -mt-1">
            {isAluno
              ? 'Rotina, tarefas, foco ativo e sala virtual com dados de demonstração.'
              : 'Painel docente: sala virtual, dúvidas das mesas e correções com dados de demonstração.'}
          </p>
        </div>

        <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] text-[#464555]">
          <div className="flex items-center gap-1.5 p-2.5 bg-[#eff4ff] rounded-2xl sticker-chip border-[#dce9ff]">
            <span className="material-symbols-outlined text-[16px] text-[#005d3e]">timer</span>
            <span>Modo Foco Ativo</span>
          </div>
          <div className="flex items-center gap-1.5 p-2.5 bg-[#eff4ff] rounded-2xl sticker-chip border-[#dce9ff]">
            <span className="material-symbols-outlined text-[16px] text-[#3a34d3]">front_hand</span>
            <span>Dúvida Discreta</span>
          </div>
        </div>
      </div>
    </div>
  );
};