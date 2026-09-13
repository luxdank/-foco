import React from 'react';
import { TabType } from '../types';

interface BottomNavProps {
  currentTab: TabType;
  onNavigate: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onNavigate }) => {
  const navItems = [
    { id: 'hoje' as TabType, label: 'Hoje', icon: 'timer' },
    { id: 'salas' as TabType, label: 'Salas', icon: 'menu_book' },
    { id: 'turma' as TabType, label: 'Turma', icon: 'forum' },
    { id: 'eu' as TabType, label: 'Eu', icon: 'person' },
  ];

  return (
    <div className="fixed bottom-0 w-full z-50 pb-safe pointer-events-none px-4">
      <nav className="pointer-events-auto mx-auto mb-4 max-w-[390px] w-full h-16 bg-white/85 backdrop-blur-2xl rounded-full shadow-[0_14px_40px_-12px_rgba(58,52,211,0.28)] border-2 border-[#e2dfff] flex items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              aria-label={item.label}
              className={`relative flex flex-col items-center justify-center min-w-[56px] h-12 rounded-full transition-all duration-200 active:scale-95 ${
                isActive ? 'text-[#3a34d3] font-bold' : 'text-[#464555] hover:text-[#3a34d3]'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <span className="absolute top-0 w-11 h-8 rounded-full bg-[#e2dfff] shadow-[inset_0_2px_0_rgba(255,255,255,0.9),0_6px_14px_-6px_rgba(58,52,211,0.55)] -z-0"></span>
              )}
              <span
                className={`relative material-symbols-outlined text-[22px] transition-transform duration-200 ${
                  isActive ? '-translate-y-0.5 scale-110' : ''
                }`}
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="relative text-[11px] font-semibold mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
