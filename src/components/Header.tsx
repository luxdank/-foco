import React from 'react';
import { TabType, UserProfile } from '../types';
import LogoImage from './LogoImage';

interface HeaderProps {
  currentTab: TabType;
  currentUser: UserProfile;
  onNavigate: (tab: TabType) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  currentUser,
  onNavigate
}) => {
  const isFocoAtivo = currentTab === 'foco-ativo';
  const isProfessor = currentUser.role === 'professor';

  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-[#fbfcff]/75 backdrop-blur-2xl border-b-2 border-[#e2dfff]/80 shadow-[0_10px_30px_-16px_rgba(58,52,211,0.35)]">
      <div className="h-16 px-4 max-w-lg mx-auto flex items-center justify-between gap-2">
        {isFocoAtivo ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('hoje')}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#dce9ff] text-[#0b1c30] transition-colors active:scale-95"
              aria-label="Voltar"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <LogoImage
              variant="dark"
              alt="+Foco Logo"
              className="h-7 w-auto object-contain cursor-pointer"
              onClick={() => onNavigate('hoje')}
            />
            <h1 className="font-bold text-[16px] text-[#0b1c30] truncate">
              Sessão Foco Ativo
            </h1>
          </div>
        ) : (
          <div
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => onNavigate(isProfessor ? 'salas' : 'hoje')}
          >
            <LogoImage
              variant="dark"
              alt="+Foco Logo"
              className="h-8 w-auto object-contain"
            />
            <span className="font-extrabold font-display text-[20px] text-gradient-primary tracking-tight">
              +Foco
            </span>
            {isProfessor && (
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-[#0b1c30] text-white rounded-full ml-1">
                Docente
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-1.5 sm:gap-2">
          {!isProfessor ? (
            /* Streak indicator for student */
            <div className="flex items-center gap-1 bg-[#ffdad3] text-[#3d0600] px-2.5 py-1 rounded-full shadow-sm sticker-chip border-[#ffb4a4]">
              <span
                className="material-symbols-outlined text-[15px] text-[#b22200] animate-wiggle"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                local_fire_department
              </span>
              <span className="text-[11px] font-bold">4 dias</span>
            </div>
          ) : null}

          {/* Profile photo with click to open profile */}
          <button
            onClick={() => onNavigate('eu')}
            className={`flex items-center justify-center p-0.5 rounded-full hover:opacity-90 transition-all ${
              currentTab === 'eu' ? 'ring-2 ring-[#3a34d3]' : ''
            }`}
            title={`${currentUser.name} (Meu Perfil)`}
            aria-label="Perfil"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-[#dce9ff]"
              referrerPolicy="no-referrer"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
