import React, { useState } from 'react';

interface EntrarSalaScreenProps {
  error?: string | null;
  onSubmit: (code: string) => void;
  onLogout: () => void;
}

export const EntrarSalaScreen: React.FC<EntrarSalaScreenProps> = ({
  error,
  onSubmit,
  onLogout
}) => {
  const [code, setCode] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    onSubmit(code);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070e17] text-white flex flex-col overflow-y-auto animate-in fade-in duration-200">
      {/* Top branding */}
      <header className="px-4 pt-8 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#3a34d3]/40 text-[#b6c0ff] flex items-center justify-center border border-[#3a34d3]/50">
            <span className="material-symbols-outlined text-[20px]">bolt</span>
          </div>
          <div>
            <p className="text-[13px] font-extrabold leading-tight">+Foco • Rotina Escolar</p>
            <p className="text-[10px] text-[#c7c4d8]">Modo Aula</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95"
          title="Encerrar sessão"
        >
          <span className="material-symbols-outlined text-[15px]">logout</span>
          Sair da sessão
        </button>
      </header>

      {/* Body */}
      <main className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-8">
        <div className="relative">
          <div className="w-16 h-16 rounded-[1.75rem] bg-[#3a34d3]/30 text-[#b6c0ff] flex items-center justify-center border-2 border-[#3a34d3]/50 animate-float-soft">
            <span className="material-symbols-outlined text-[32px]">vpn_key</span>
          </div>
          <span className="absolute -top-2 -right-3 text-[22px] animate-wiggle select-none" role="img" aria-label="chave">
            🔑
          </span>
        </div>

        <div className="text-center">
          <h1 className="text-[20px] font-extrabold text-white">Entrar na Sala Virtual</h1>
          <p className="text-[12px] text-[#c7c4d8] mt-1.5 max-w-xs leading-relaxed mx-auto">
            Digite abaixo o código da sala que o professor criou para começar a aula.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3">
          <div className="bg-[#131d2b] border border-[#3a34d3]/50 rounded-2xl px-4 py-3.5 flex items-center gap-2.5 focus-within:border-[#3a34d3] transition-colors">
            <span className="material-symbols-outlined text-[20px] text-[#6ffbbe] shrink-0">
              key
            </span>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="CÓDIGO DA SALA (ex: FOCO-3A-MAT)"
              className="flex-1 bg-transparent text-[15px] font-mono font-bold tracking-wider text-white placeholder:text-white/30 placeholder:font-sans placeholder:font-normal placeholder:tracking-normal focus:outline-none"
              autoFocus
              spellCheck={false}
            />
          </div>

          <button
            type="submit"
            disabled={!code.trim()}
            className="w-full py-3 rounded-xl bg-[#3a34d3] hover:bg-[#5452ec] disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-[13px] flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cartoon-btn"
          >
            <span className="material-symbols-outlined text-[18px]">meeting_room</span>
            Entrar na sala
          </button>

          {error && (
            <div className="bg-[#ffdad3]/15 border border-[#ffdad3]/40 text-[#ffb77c] rounded-xl px-3.5 py-2.5 text-[11px] font-semibold leading-relaxed">
              <span className="flex items-start gap-1.5">
                <span className="material-symbols-outlined text-[15px] shrink-0">error</span>
                <span>{error}</span>
              </span>
            </div>
          )}
        </form>

        <p className="text-[10px] text-[#c7c4d8]/80 max-w-xs text-center leading-relaxed">
          O código é gerado pelo professor ao criar/abrir a sala. Sua requisição é enviada
          diretamente para a sala correspondente em tempo real.
        </p>
      </main>
    </div>
  );
};