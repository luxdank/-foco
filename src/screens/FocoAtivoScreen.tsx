import React, { useState, useEffect } from 'react';
import { APP_IMAGES } from '../data/mockData';
import { ambientSound } from '../utils/soundGenerator';

interface FocoAtivoScreenProps {
  onOpenActivityModal: () => void;
  activityDone: boolean;
  onSendDoubt?: (topic: string, question: string) => void;
  onSendPulse?: (feedback: string) => void;
  studentName?: string;
}

export const FocoAtivoScreen: React.FC<FocoAtivoScreenProps> = ({
  onOpenActivityModal,
  activityDone,
  onSendDoubt,
  onSendPulse,
  studentName = 'Lucas Andrade'
}) => {
  // Timer state: starts at 24:18 (1458 seconds)
  const [secondsLeft, setSecondsLeft] = useState<number>(24 * 60 + 18);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [doubtState, setDoubtState] = useState<'idle' | 'notified'>('idle');
  const [showPulseModal, setShowPulseModal] = useState<boolean>(false);
  const [pulseFeedback, setPulseFeedback] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [soundMode, setSoundMode] = useState<'rain' | 'brown'>('rain');

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, secondsLeft]);

  const toggleSound = (mode: 'rain' | 'brown') => {
    setSoundMode(mode);
    const active = ambientSound.toggle(mode);
    setIsPlayingAudio(active);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // SVG circle calculation: radius = 70, circumference = 2 * PI * 70 ≈ 440
  const maxSeconds = 25 * 60; // 25 min stage
  const progressRatio = secondsLeft / maxSeconds;
  const strokeDashoffset = 440 - 440 * Math.max(0, Math.min(1, progressRatio));

  const handleTriggerDoubt = () => {
    setDoubtState('notified');
    if (onSendDoubt) {
      onSendDoubt('Cálculo de Volume - Prisma Reto', 'Dúvida na aplicação de r² na base do cilindro oblíquo (Página 42).');
    }
    setTimeout(() => {
      setDoubtState('idle');
    }, 6000);
  };

  const handleClosePulse = (feedback: string | null) => {
    setShowPulseModal(false);
    if (feedback) {
      setPulseFeedback(feedback);
      if (onSendPulse) {
        onSendPulse(feedback);
      }
      setTimeout(() => setPulseFeedback(null), 4000);
    }
  };

  return (
    <div className="flex flex-col w-full gap-5 pb-12">
      {/* Status Zen de Autorregulação */}
      <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-full bg-[#eff4ff] border border-[#dce9ff] shadow-sm">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6ffbbe] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#005d3e]"></span>
          </span>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#005d3e]">
            Modo Foco Ativo
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[#464555]">
          <span className="material-symbols-outlined text-[16px] text-[#3a34d3]">
            spa
          </span>
          <span className="text-[12px] font-semibold">Autorregulação Inteligente</span>
        </div>
      </div>

      {/* Identificação da Aula e Ambiente */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5eeff] space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#e5eeff] text-[#3a34d3] text-[11px] font-bold">
              Matemática
            </span>
            <h2 className="text-[20px] font-bold text-[#0b1c30]">
              Geometria Espacial &amp; Prismas
            </h2>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#e2dfff] flex items-center justify-center text-[#3a34d3]">
            <span className="material-symbols-outlined text-[22px]">shapes</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[#464555] text-[12px] pt-1">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">school</span>
            <span>Prof. Ricardo Mendes</span>
          </div>
          <span className="text-[#c7c4d8]">•</span>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">meeting_room</span>
            <span>Sala 04</span>
          </div>
        </div>
      </div>

      {/* Cronômetro Circular Elegante e Fluido */}
      <div className="relative bg-white rounded-2xl p-6 shadow-sm border border-[#e5eeff] flex flex-col items-center justify-center overflow-hidden">
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            <circle
              className="text-[#dce9ff]"
              cx="80"
              cy="80"
              fill="transparent"
              r="70"
              stroke="currentColor"
              strokeWidth="8"
            ></circle>
            <circle
              className="text-[#3a34d3] transition-all duration-1000"
              cx="80"
              cy="80"
              fill="transparent"
              r="70"
              stroke="currentColor"
              strokeDasharray="440"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              strokeWidth="8"
            ></circle>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
            <span className="text-[34px] font-extrabold text-[#0b1c30] tracking-tight font-mono">
              {formatTime(secondsLeft)}
            </span>
            <span className="text-[10px] text-[#464555] font-bold uppercase tracking-wider mt-0.5">
              Tempo da Etapa
            </span>

            {/* Micro timer controls */}
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="p-1 rounded-full text-[#3a34d3] hover:bg-[#eff4ff] transition-colors"
                title={isTimerRunning ? 'Pausar foco' : 'Retomar foco'}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isTimerRunning ? 'pause' : 'play_arrow'}
                </span>
              </button>
              <button
                onClick={() => setSecondsLeft(24 * 60 + 18)}
                className="p-1 rounded-full text-[#777587] hover:bg-[#eff4ff] transition-colors"
                title="Reiniciar cronômetro"
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              </button>
            </div>
          </div>
        </div>

        {/* Meta de Co-estudo Fluida com Links Diretos */}
        <div className="mt-4 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e5eeff] border border-[#dce9ff]">
          <div className="flex -space-x-1.5 overflow-hidden">
            {APP_IMAGES.peers.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Colega ${i + 1}`}
                className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                referrerPolicy="no-referrer"
              />
            ))}
          </div>
          <span className="text-[12px] font-semibold text-[#464555]">
            28 colegas focados com você
          </span>
        </div>
      </div>

      {/* Timeline de Etapas da Aula */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5eeff] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-bold text-[#0b1c30]">Jornada da Aula</h3>
          <span className="text-[11px] text-[#3a34d3] font-bold bg-[#e2dfff] px-2 py-0.5 rounded">
            Etapa 2 de 3
          </span>
        </div>

        <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-[#dce9ff] before:h-[80%]">
          {/* Etapa 1: Concluída */}
          <div className="relative flex items-center gap-3.5">
            <div className="w-7 h-7 rounded-full bg-[#6ffbbe] text-[#005236] flex items-center justify-center shrink-0 z-10">
              <span className="material-symbols-outlined text-[16px] font-bold">
                check
              </span>
            </div>
            <div className="flex-1 flex items-center justify-between">
              <div>
                <p className="text-[14px] font-medium text-[#0b1c30] line-through opacity-60">
                  Revisão inicial de conceitos
                </p>
                <p className="text-[11px] text-[#464555]">Concluído • 10 min</p>
              </div>
              <span className="material-symbols-outlined text-[#777587] text-[18px]">
                verified
              </span>
            </div>
          </div>

          {/* Etapa 2: Atual */}
          <div className="relative flex items-center gap-3.5">
            <div className="w-7 h-7 rounded-full bg-[#3a34d3] text-white flex items-center justify-center shrink-0 z-10 shadow-sm">
              <span className="material-symbols-outlined text-[16px]">play_arrow</span>
            </div>
            <div className="flex-1 p-3 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-between">
              <div>
                <p className="text-[14px] font-bold text-[#3a34d3]">
                  Resolução de problema em duplas
                </p>
                <p className="text-[11px] text-[#464555]">Em andamento • 20 min</p>
              </div>
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#3a34d3] animate-pulse"></span>
            </div>
          </div>

          {/* Etapa 3: Próxima */}
          <div className="relative flex items-center gap-3.5">
            <div className="w-7 h-7 rounded-full bg-[#dce9ff] text-[#777587] flex items-center justify-center shrink-0 z-10">
              <span className="material-symbols-outlined text-[16px]">
                hourglass_empty
              </span>
            </div>
            <div className="flex-1">
              <p className="text-[14px] text-[#0b1c30] opacity-75 font-medium">
                Pulso da Turma &amp; Quiz final
              </p>
              <p className="text-[11px] text-[#464555]">A seguir • 15 min</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card de Ação Principal em Destaque */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#3a34d3] to-[#5452ec] text-white rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-2 text-[#e9e6ff]">
          <span className="material-symbols-outlined text-[20px]">assignment</span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider">
            Atividade Prática em Andamento
          </span>
        </div>

        <div className="space-y-1">
          <h4 className="text-[18px] font-bold text-white">Cálculo de Volume</h4>
          <p className="text-[13px] text-[#e9e6ff] leading-relaxed">
            Calcule o volume do cilindro reto na página 42 do livro didático com sua dupla.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenActivityModal}
          className="w-full py-3.5 px-4 rounded-xl bg-white text-[#3a34d3] font-bold text-[14px] flex items-center justify-center gap-2 shadow-md hover:bg-[#f8f9ff] transition-all active:scale-95"
        >
          <span>{activityDone ? 'Atividade Enviada ✓ (Rever)' : 'Responder Atividade Agora'}</span>
          <span className="material-symbols-outlined text-[20px]">
            {activityDone ? 'check' : 'edit_square'}
          </span>
        </button>
      </div>

      {/* Ações Rápidas, Discretas e Não Punitivas */}
      <div className="grid grid-cols-2 gap-3">
        {/* Dúvida Discreta */}
        <button
          type="button"
          onClick={handleTriggerDoubt}
          className={`flex flex-col items-start justify-between p-4 rounded-2xl border text-left shadow-sm transition-all active:scale-95 ${
            doubtState === 'notified'
              ? 'bg-[#eff4ff] border-[#6ffbbe]'
              : 'bg-white border-[#e5eeff] hover:bg-[#eff4ff]'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center mb-3 transition-colors ${
              doubtState === 'notified'
                ? 'bg-[#6ffbbe] text-[#005236]'
                : 'bg-[#ffdad3] text-[#b22200]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {doubtState === 'notified' ? 'done_all' : 'front_hand'}
            </span>
          </div>
          <div className="space-y-0.5">
            <span
              className={`text-[14px] font-bold block ${
                doubtState === 'notified' ? 'text-[#005d3e]' : 'text-[#0b1c30]'
              }`}
            >
              {doubtState === 'notified' ? 'Professor Avisado' : 'Tenho uma Dúvida'}
            </span>
            <span className="text-[11px] text-[#464555] block leading-tight">
              {doubtState === 'notified'
                ? 'Ricardo virá até sua mesa'
                : 'Sinalize o professor discretamente'}
            </span>
          </div>
        </button>

        {/* Pulso da Aula */}
        <button
          type="button"
          onClick={() => setShowPulseModal(true)}
          className="flex flex-col items-start justify-between p-4 rounded-2xl bg-white border border-[#e5eeff] text-left shadow-sm hover:bg-[#eff4ff] transition-all active:scale-95"
        >
          <div className="w-9 h-9 rounded-full bg-[#6ffbbe] text-[#005236] flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-[18px]">
              sentiment_satisfied
            </span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[14px] font-bold text-[#0b1c30] block">
              {pulseFeedback ? `Pulso: ${pulseFeedback} ✨` : 'Pulso da Aula'}
            </span>
            <span className="text-[11px] text-[#464555] block leading-tight">
              Como está seu ritmo agora?
            </span>
          </div>
        </button>
      </div>

      {/* Gerador de Som Ambiente de Concentração (Áudio Real) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e5eeff] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                isPlayingAudio ? 'bg-[#3a34d3] text-white animate-pulse' : 'bg-[#eff4ff] text-[#3a34d3]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isPlayingAudio ? 'volume_up' : 'headphones'}
              </span>
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-[#0b1c30]">
                Som de Foco {isPlayingAudio ? '(Tocando)' : '(Silencioso)'}
              </h4>
              <p className="text-[11px] text-[#464555]">
                {isPlayingAudio ? 'Áudio de concentração ativo nos fones' : 'Isole o ruído externo da sala'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => toggleSound(soundMode)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-all active:scale-95 flex items-center gap-1 ${
              isPlayingAudio
                ? 'bg-[#b22200] text-white'
                : 'bg-[#3a34d3] text-white hover:bg-[#5452ec]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {isPlayingAudio ? 'stop' : 'play_arrow'}
            </span>
            <span>{isPlayingAudio ? 'Pausar' : 'Ouvir'}</span>
          </button>
        </div>

        {/* Audio profile selector */}
        <div className="flex items-center gap-2 pt-1 border-t border-[#f1f5f9]">
          <button
            type="button"
            onClick={() => toggleSound('rain')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
              isPlayingAudio && soundMode === 'rain'
                ? 'bg-[#e5eeff] text-[#3a34d3] ring-1 ring-[#3a34d3]'
                : 'bg-[#f8f9ff] text-[#464555] hover:bg-[#eff4ff]'
            }`}
          >
            <span>🌧️ Chuva Suave</span>
          </button>
          <button
            type="button"
            onClick={() => toggleSound('brown')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
              isPlayingAudio && soundMode === 'brown'
                ? 'bg-[#e5eeff] text-[#3a34d3] ring-1 ring-[#3a34d3]'
                : 'bg-[#f8f9ff] text-[#464555] hover:bg-[#eff4ff]'
            }`}
          >
            <span>☕ Ruído Marrom</span>
          </button>
        </div>
      </div>

      {/* Card Sutil de Bem-Estar Digital */}
      <div className="bg-[#eff4ff] border border-[#dce9ff] rounded-2xl p-4 flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-full bg-[#dce9ff] text-[#3a34d3] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[20px]">
            notifications_paused
          </span>
        </div>
        <div className="flex-1">
          <p className="text-[12px] text-[#0b1c30] font-semibold leading-tight">
            Notificações sociais silenciadas com carinho.
          </p>
          <p className="text-[11px] text-[#464555] mt-0.5">
            Seu tempo livre volta automaticamente às 10:30.
          </p>
        </div>
      </div>

      {/* Modal/Sheet de Feedback Rápido de Pulso */}
      {showPulseModal && (
        <div className="fixed inset-0 z-50 bg-[#0b1c30]/40 backdrop-blur-sm flex items-end justify-center p-0 sm:p-4">
          <div className="bg-white w-full rounded-t-2xl sm:rounded-2xl p-6 space-y-4 max-w-md shadow-2xl border border-[#e5eeff]">
            <div className="w-12 h-1 bg-[#dce9ff] rounded-full mx-auto mb-2"></div>
            <div className="text-center space-y-1">
              <h4 className="text-[18px] font-bold text-[#0b1c30]">
                Como você está acompanhando?
              </h4>
              <p className="text-[12px] text-[#464555]">
                Sua resposta é anônima e ajuda o professor a calibrar a explicação.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleClosePulse('Fluindo bem')}
                className="flex flex-col items-center p-3 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-center gap-1 active:scale-95 transition-all"
              >
                <span className="text-2xl">🚀</span>
                <span className="text-[11px] text-[#0b1c30] font-bold">Fluindo bem</span>
              </button>
              <button
                type="button"
                onClick={() => handleClosePulse('No Ritmo')}
                className="flex flex-col items-center p-3 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-center gap-1 active:scale-95 transition-all"
              >
                <span className="text-2xl">🤔</span>
                <span className="text-[11px] text-[#0b1c30] font-bold">Quase peguei</span>
              </button>
              <button
                type="button"
                onClick={() => handleClosePulse('Preciso de Ajuda')}
                className="flex flex-col items-center p-3 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-center gap-1 active:scale-95 transition-all"
              >
                <span className="text-2xl">💡</span>
                <span className="text-[11px] text-[#0b1c30] font-bold">Pode repetir?</span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => handleClosePulse(null)}
              className="w-full py-2.5 rounded-xl text-[#464555] text-[13px] font-semibold hover:bg-[#f8f9ff]"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
