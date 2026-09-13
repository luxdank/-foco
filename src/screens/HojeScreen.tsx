import React, { useState } from 'react';
import { MoodType, TabType, VirtualRoomInfo } from '../types';
import LogoImage from '../components/LogoImage';

interface HojeScreenProps {
  onNavigate: (tab: TabType) => void;
  onOpenQuickDoubt: () => void;
  virtualRoom?: VirtualRoomInfo;
  onEnterVirtualRoom?: () => void;
}

export const HojeScreen: React.FC<HojeScreenProps> = ({
  onNavigate,
  onOpenQuickDoubt,
  virtualRoom,
  onEnterVirtualRoom
}) => {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>('focado');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedAudio, setRecordedAudio] = useState<boolean>(false);
  const [showAllTasks, setShowAllTasks] = useState<boolean>(false);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood);
  };

  const handleRecordToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      setRecordedAudio(true);
    } else {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setRecordedAudio(true);
      }, 4000);
    }
  };

  return (
    <div className="flex flex-col w-full gap-5 pb-8">
      {/* Saudação Personalizada */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-[26px] font-extrabold text-[#0b1c30] tracking-tight">
              E aí, Lucas
            </h1>
            <span className="text-2xl animate-bounce">👋</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#dce9ff] rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#005d3e] animate-ping"></span>
            <span className="text-[11px] text-[#005d3e] font-bold tracking-wide">
              AO VIVO
            </span>
          </div>
        </div>
        <p className="text-[14px] text-[#464555]">
          Você tem <span className="font-bold text-gradient-primary">2 atividades prioritárias</span> na sua rotina de hoje.
        </p>
      </div>

      {/* SALA VIRTUAL AO VIVO (Iniciada com autonomia pelo Professor) */}
      {virtualRoom && virtualRoom.isActive && (
        <div className="bg-gradient-to-r from-[#005d3e] via-[#004b32] to-[#0b1c30] text-white p-4 sm:p-5 rounded-3xl shadow-lg border border-[#6ffbbe]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#6ffbbe]/20 text-[#6ffbbe] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[26px] animate-pulse">
                video_camera_front
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <LogoImage variant="light" alt="+Foco" className="h-5 w-auto object-contain shrink-0" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#6ffbbe] text-[#005236]">
                  SALA NATIVA +Foco • AO VIVO
                </span>
                <span className="text-[11px] text-[#c7c4d8] font-mono">
                  {virtualRoom.accessCode}
                </span>
              </div>
              <h3 className="text-[16px] font-bold text-white mt-0.5">
                {virtualRoom.roomName}
              </h3>
              <p className="text-[12px] text-[#e5eeff] line-clamp-1">
                {virtualRoom.topicDescription || 'Acesse a transmissão ao vivo com o professor.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={onEnterVirtualRoom}
              className="px-4 py-2.5 rounded-xl bg-[#6ffbbe] hover:bg-[#52ebb0] text-[#005236] font-bold text-[13px] flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">co_present</span>
              <span>Entrar como Aluno</span>
            </button>
          </div>
        </div>
      )}

      {/* Card Destaque: Aula Ao Vivo em Andamento */}
      <div
        onClick={() => onNavigate('foco-ativo')}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#3a34d3] via-[#5452ec] to-[#4946e1] text-white p-5 shadow-xl shadow-[#3a34d3]/20 transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
      >
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute top-0 right-0 p-3 opacity-15 pointer-events-none">
          <span className="material-symbols-outlined text-[96px] select-none">
            calculate
          </span>
        </div>

        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full">
              <span className="material-symbols-outlined text-[14px] text-white">
                schedule
              </span>
              <span className="text-[11px] font-semibold text-white">
                Começou há 12 min
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-[#e9e6ff] font-bold bg-black/25 px-2 py-0.5 rounded">
              3º ANO A
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-[20px] font-extrabold text-white leading-snug">
              Matemática — Aula em andamento
            </h2>
            <div className="flex items-center gap-2 text-[#e9e6ff] text-[12px]">
              <span className="material-symbols-outlined text-[16px]">school</span>
              <span>Prof. Ricardo Mendes</span>
              <span className="w-1 h-1 rounded-full bg-white/50"></span>
              <span>Sala 04</span>
            </div>
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('foco-ativo');
              }}
              className="w-full h-12 bg-white text-[#3a34d3] rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 shadow-md hover:bg-[#f8f9ff] transition-all active:scale-[0.98]"
            >
              <span
                className="material-symbols-outlined text-[20px] text-[#3a34d3]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                bolt
              </span>
              <span>Entrar no Modo Aula</span>
            </button>
          </div>
        </div>
      </div>

      {/* Widget Ritmo de Foco & Presença */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5eeff] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#ffdad3] flex items-center justify-center text-[#b22200]">
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                local_fire_department
              </span>
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-[#0b1c30]">Ritmo Semanal</h3>
              <p className="text-[12px] text-[#464555]">Sua constância gera evolução</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-[#ffdad3] text-[#3d0600] px-3 py-1 rounded-full">
            <span className="material-symbols-outlined text-[16px] text-[#b22200]">
              flash_on
            </span>
            <span className="text-[11px] font-extrabold">🔥 4 DIAS</span>
          </div>
        </div>

        {/* Barra de Progresso Semanal */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex justify-between items-center text-[12px]">
            <span className="text-[#464555] font-medium">Meta semanal de presença</span>
            <span className="text-[#3a34d3] font-bold">88% concluído</span>
          </div>
          <div className="w-full h-2.5 bg-[#e5eeff] rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#3a34d3] to-[#4946e1] rounded-full transition-all duration-700"
              style={{ width: '88%' }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-[10px] text-[#464555] pt-1 font-semibold">
            <span className="text-[#3a34d3] font-bold">SEG ●</span>
            <span className="text-[#3a34d3] font-bold">TER ●</span>
            <span className="text-[#3a34d3] font-bold">QUA ●</span>
            <span className="text-[#3a34d3] font-bold">QUI ●</span>
            <span className="opacity-50">SEX ○</span>
            <span className="opacity-30">SÁB ○</span>
          </div>
        </div>
      </div>

      {/* Próximas Atividades & Tarefas */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#3a34d3] text-[22px]">
              assignment_turned_in
            </span>
            <h3 className="text-[16px] font-bold text-[#0b1c30]">Próximas Tarefas</h3>
          </div>
          <button
            onClick={() => setShowAllTasks(!showAllTasks)}
            className="text-[12px] text-[#3a34d3] font-bold hover:underline"
          >
            {showAllTasks ? 'Ver menos' : 'Ver todas (5)'}
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {/* Card Tarefa 1 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e5eeff] flex flex-col gap-2.5 transition-all hover:border-[#c1c1ff]">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[10px] text-[#3a34d3] font-extrabold uppercase tracking-wide">
                  Física Térmica
                </span>
                <h4 className="text-[16px] font-bold text-[#0b1c30] truncate">
                  Desafio das Leis dos Gases
                </h4>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#e2dfff] text-[#0a006b] text-[11px] font-bold whitespace-nowrap">
                {quizCompleted ? 'Concluído ✨' : 'Interativa'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 text-[#464555] text-[12px]">
              <div className="flex items-center gap-1.5 text-[#b22200] font-semibold">
                <span className="material-symbols-outlined text-[16px]">alarm</span>
                <span>Hoje até 14:30</span>
              </div>
              <div className="flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-[16px] text-[#777587]">
                  quiz
                </span>
                <span>3 questões rápidas</span>
              </div>
            </div>

            <div className="w-full h-1.5 bg-[#e5eeff] rounded-full overflow-hidden mt-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  quizCompleted ? 'bg-[#005d3e] w-full' : 'bg-[#3a34d3] w-1/3'
                }`}
              ></div>
            </div>

            {!quizCompleted && (
              <button
                onClick={() => {
                  setQuizCompleted(true);
                }}
                className="w-full py-2 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#3a34d3] text-[12px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 mt-1"
              >
                <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                <span>Iniciar Desafio de Física (3 min)</span>
              </button>
            )}
          </div>

          {/* Card Tarefa 2 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e5eeff] flex flex-col gap-2.5 transition-all hover:border-[#ffdad3]">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[10px] text-[#b22200] font-extrabold uppercase tracking-wide">
                  História do Brasil
                </span>
                <h4 className="text-[16px] font-bold text-[#0b1c30] truncate">
                  Debate: Política do Café com Leite
                </h4>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#ffdad3] text-[#3d0600] text-[11px] font-bold whitespace-nowrap">
                Áudio / Criar
              </span>
            </div>

            <p className="text-[13px] text-[#464555] line-clamp-2">
              Gravar áudio reflexivo de 1 min sobre os acordos de alternância de poder de MG e SP.
            </p>

            <div className="flex items-center justify-between pt-1 text-[#464555] text-[12px]">
              <div className="flex items-center gap-1.5 font-semibold text-[#777587]">
                <span className="material-symbols-outlined text-[16px]">event</span>
                <span>Amanhã • 08:00</span>
              </div>
              <button
                type="button"
                onClick={handleRecordToggle}
                className={`flex items-center gap-1 font-bold text-[12px] px-3 py-1.5 rounded-lg active:scale-95 transition-all ${
                  isRecording
                    ? 'bg-[#ba1a1a] text-white animate-pulse'
                    : recordedAudio
                    ? 'bg-[#e5eeff] text-[#3a34d3]'
                    : 'bg-[#ffdad3] text-[#b22200] hover:bg-[#ffb4a4]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isRecording ? 'stop' : recordedAudio ? 'check' : 'mic'}
                </span>
                <span>
                  {isRecording
                    ? 'Gravando... (clique p/ parar)'
                    : recordedAudio
                    ? 'Áudio Pronto (1:02)'
                    : 'Gravar'}
                </span>
              </button>
            </div>
          </div>

          {/* Tarefas expandidas extras se o usuário clicar em "Ver todas" */}
          {showAllTasks && (
            <>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e5eeff] flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] text-[#005d3e] font-extrabold uppercase tracking-wide">
                    Biologia
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#6ffbbe]/40 text-[#005236] text-[10px] font-bold">
                    Grupo
                  </span>
                </div>
                <h4 className="text-[15px] font-bold text-[#0b1c30]">
                  Cruzamento Genético de Mendel
                </h4>
                <div className="flex items-center justify-between text-[12px] text-[#777587]">
                  <span>Quinta-feira • 18:00</span>
                  <span className="text-[#005d3e] font-semibold">Em andamento</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e5eeff] flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] text-[#d73b19] font-extrabold uppercase tracking-wide">
                    Língua Portuguesa
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#ffdad3] text-[#3d0600] text-[10px] font-bold">
                    Leitura
                  </span>
                </div>
                <h4 className="text-[15px] font-bold text-[#0b1c30]">
                  Modernismo Brasileiro &amp; Semana de 22
                </h4>
                <div className="flex items-center justify-between text-[12px] text-[#777587]">
                  <span>Sexta-feira • 10:00</span>
                  <span className="text-[#3a34d3] font-semibold">PDF disponível</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Pulso Rápido: Como está seu ritmo? */}
      <div className="bg-[#eff4ff] rounded-2xl p-4 shadow-sm border border-[#dce9ff] flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-bold text-[#0b1c30]">
            Como está seu pique agora?
          </span>
          <span className="text-[12px] text-[#777587] font-medium">Check-in diário</span>
        </div>

        <div className="grid grid-cols-3 gap-2" id="mood-selector">
          <button
            type="button"
            onClick={() => handleMoodSelect('pique')}
            className={`mood-btn flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl transition-all shadow-sm active:scale-95 ${
              selectedMood === 'pique'
                ? 'bg-[#3a34d3] text-white shadow-md'
                : 'bg-white text-[#0b1c30] hover:bg-[#e2dfff]/40'
            }`}
          >
            <span className="text-xl">🚀</span>
            <span className="text-[11px] font-bold">No pique</span>
          </button>

          <button
            type="button"
            onClick={() => handleMoodSelect('focado')}
            className={`mood-btn flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl transition-all shadow-sm active:scale-95 ${
              selectedMood === 'focado'
                ? 'bg-[#3a34d3] text-white shadow-md'
                : 'bg-white text-[#0b1c30] hover:bg-[#e2dfff]/40'
            }`}
          >
            <span className="text-xl">🧠</span>
            <span className="text-[11px] font-bold">Focado</span>
          </button>

          <button
            type="button"
            onClick={() => handleMoodSelect('cafe')}
            className={`mood-btn flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl transition-all shadow-sm active:scale-95 ${
              selectedMood === 'cafe'
                ? 'bg-[#3a34d3] text-white shadow-md'
                : 'bg-white text-[#0b1c30] hover:bg-[#e2dfff]/40'
            }`}
          >
            <span className="text-xl">☕</span>
            <span className="text-[11px] font-bold">Preciso café</span>
          </button>
        </div>

        {selectedMood && (
          <p className="text-[11px] text-[#464555] text-center pt-0.5">
            {selectedMood === 'pique' && '🔥 Energia alta! Excelente momento para resolver o desafio de matemática.'}
            {selectedMood === 'focado' && '✨ Estado ideal de concentração para a sessão em andamento.'}
            {selectedMood === 'cafe' && '☕ Lembre-se de tomar água e respirar fundo entre as tarefas.'}
          </p>
        )}
      </div>

      {/* Botão de Acesso Rápido Discreto: Dúvida Rápida ao Professor */}
      <div className="pt-0.5">
        <button
          type="button"
          onClick={onOpenQuickDoubt}
          className="w-full py-3.5 px-4 bg-[#dce9ff] hover:bg-[#c1c1ff] rounded-xl text-[#3a34d3] font-bold text-[14px] flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">help_outline</span>
          <span>Dúvida Rápida ao Professor</span>
        </button>
      </div>
    </div>
  );
};
