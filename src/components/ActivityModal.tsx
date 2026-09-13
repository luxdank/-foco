import React, { useState } from 'react';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSubmitActivity?: (answer: string, stepWork: string) => void;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onSubmitActivity
}) => {
  const [radius] = useState<number>(4);
  const [height] = useState<number>(10);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [partnerName] = useState<string>('Mariana Duarte (Dupla)');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  // Cylinder Volume: V = pi * r^2 * h
  // 3.14 * 16 * 10 = 502.4 or 160*pi
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(userAnswer.replace(',', '.').trim());
    if (isNaN(val)) {
      setErrorMsg('Por favor insira um número válido.');
      return;
    }

    // Accept approx values (e.g. 502.4, 502, 503, 160)
    if (val >= 150 && val <= 520) {
      setErrorMsg('');
      setSubmitted(true);
      if (onSubmitActivity) {
        onSubmitActivity(
          `${userAnswer.trim()} cm³`,
          `V = π · r² · h = 3.14 · 4² · 10 = 3.14 · 16 · 10 ≈ ${userAnswer.trim()} cm³`
        );
      }
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } else {
      setErrorMsg('Dica: Use V = π · r² · h. Para r=4 e h=10, V ≈ 3.14 · 16 · 10.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0b1c30]/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#e5eeff] bg-[#f8f9ff] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#5452ec] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">assignment</span>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#3a34d3]">
                Atividade Prática em Andamento
              </div>
              <h3 className="font-bold text-[17px] text-[#0b1c30]">Cálculo de Volume</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#464555]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#6ffbbe] text-[#005d3e] flex items-center justify-center animate-bounce">
              <span className="material-symbols-outlined text-[32px]">check_circle</span>
            </div>
            <h4 className="font-bold text-[18px] text-[#0b1c30]">
              Resposta Enviada com Sucesso!
            </h4>
            <p className="text-[13px] text-[#464555] max-w-sm">
              Sua resposta e a de {partnerName} foram sincronizadas no painel do Prof. Ricardo Mendes.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Dupla info */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#eff4ff] text-[13px] text-[#0b1c30]">
              <span className="flex items-center gap-1.5 font-semibold">
                <span className="material-symbols-outlined text-[#3a34d3] text-[18px]">group</span>
                Trabalho em Dupla:
              </span>
              <span className="font-bold text-[#3a34d3]">{partnerName}</span>
            </div>

            {/* Enunciado */}
            <div className="bg-[#f8f9ff] p-3.5 rounded-xl border border-[#e5eeff] text-[13px] text-[#464555] space-y-1.5">
              <p className="font-medium text-[#0b1c30]">
                <strong>Problema (Livro pág. 42):</strong> Calcule o volume de um cilindro circular reto cuja base possui raio <span className="font-bold text-[#3a34d3]">r = {radius} cm</span> e altura <span className="font-bold text-[#3a34d3]">h = {height} cm</span>. Considere π ≈ 3,14.
              </p>
              <div className="text-[12px] bg-white p-2 rounded border border-[#dce9ff] font-mono text-[#3a34d3] flex items-center justify-between">
                <span>Fórmula: V = π · r² · h</span>
                <span className="text-[11px] text-[#777587]">Ex.: 3.14 · 16 · 10</span>
              </div>
            </div>

            {/* Input */}
            <div>
              <label className="block text-[12px] font-bold text-[#464555] uppercase tracking-wider mb-1">
                Volume calculado (em cm³)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Ex: 502.4"
                  required
                  className="w-full h-12 px-3.5 rounded-lg border border-[#e5eeff] bg-[#f8f9ff] text-[#0b1c30] text-[16px] font-bold focus:outline-none focus:border-[#3a34d3]"
                />
                <span className="absolute right-3.5 top-3 text-[13px] font-bold text-[#777587]">
                  cm³
                </span>
              </div>
              {errorMsg && (
                <p className="text-[12px] text-[#ba1a1a] font-medium mt-1.5">{errorMsg}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e5eeff]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg text-[#464555] text-[13px] font-semibold hover:bg-[#f8f9ff]"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-[#3a34d3] hover:bg-[#5452ec] text-white text-[13px] font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                <span>Confirmar Resposta</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
