import React, { useState } from 'react';
import { SUBJECTS_DATA } from '../data/mockData';

interface QuickDoubtModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubjectId?: string;
  onSendDoubt?: (subject: string, text: string) => void;
}

export const QuickDoubtModal: React.FC<QuickDoubtModalProps> = ({
  isOpen,
  onClose,
  defaultSubjectId = 'matematica',
  onSendDoubt
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>(defaultSubjectId);
  const [doubtText, setDoubtText] = useState<string>('');
  const [isSent, setIsSent] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtText.trim()) return;
    setIsSent(true);
    if (onSendDoubt) {
      const subj = SUBJECTS_DATA.find((s) => s.id === selectedSubject);
      onSendDoubt(subj ? subj.name : 'Geral', doubtText.trim());
    }
    setTimeout(() => {
      setIsSent(false);
      setDoubtText('');
      onClose();
    }, 2200);
  };

  const subject = SUBJECTS_DATA.find((s) => s.id === selectedSubject) || SUBJECTS_DATA[0];

  return (
    <div className="fixed inset-0 z-50 bg-[#0b1c30]/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-[#e5eeff] flex items-center justify-between bg-[#f8f9ff]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#e2dfff] text-[#3a34d3] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">help_outline</span>
            </div>
            <div>
              <h3 className="font-bold text-[16px] text-[#0b1c30]">
                Dúvida Rápida ao Professor
              </h3>
              <p className="text-[12px] text-[#464555]">
                Mensagem pontual e discreta para apoio em sala
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#464555]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {isSent ? (
          <div className="p-8 text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#6ffbbe] text-[#005d3e] flex items-center justify-center animate-bounce">
              <span className="material-symbols-outlined text-[32px]">check_circle</span>
            </div>
            <h4 className="font-bold text-[18px] text-[#0b1c30]">Dúvida Enviada!</h4>
            <p className="text-[14px] text-[#464555] max-w-xs">
              {subject.teacher.name} recebeu sua notificação e responderá em instantes.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-[12px] font-bold text-[#464555] uppercase tracking-wider mb-1.5">
                Disciplina & Professor
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-[#e5eeff] bg-[#f8f9ff] text-[#0b1c30] text-[14px] font-semibold focus:outline-none focus:border-[#3a34d3]"
              >
                {SUBJECTS_DATA.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.teacher.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#eff4ff] border border-[#dce9ff]">
              <img
                src={subject.teacher.avatar}
                alt={subject.teacher.name}
                className="w-10 h-10 rounded-full object-cover shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <div className="text-[13px] font-bold text-[#0b1c30]">
                  {subject.teacher.name}
                </div>
                <div className="text-[11px] text-[#464555]">{subject.room} • Ativo agora</div>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#464555] uppercase tracking-wider mb-1.5">
                Descreva sua dúvida
              </label>
              <textarea
                value={doubtText}
                onChange={(e) => setDoubtText(e.target.value)}
                placeholder="Ex.: Não entendi a transição da fórmula do prisma na etapa 2..."
                rows={3}
                required
                className="w-full p-3 rounded-lg border border-[#e5eeff] bg-[#f8f9ff] text-[#0b1c30] text-[14px] focus:outline-none focus:border-[#3a34d3] placeholder-[#777587]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg text-[#464555] text-[13px] font-semibold hover:bg-[#f8f9ff]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!doubtText.trim()}
                className="px-5 py-2.5 rounded-lg bg-[#3a34d3] hover:bg-[#5452ec] disabled:opacity-50 text-white text-[13px] font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                <span>Enviar Dúvida</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
