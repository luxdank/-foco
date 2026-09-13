import React, { useState } from 'react';
import { UserProfile, TeacherActivity, VirtualRoomInfo } from '../types';
import { useRoomAttention } from '../lib/attentionStore';

interface ProfessorScreenProps {
  currentUser: UserProfile;
  activities: TeacherActivity[];
  virtualRoom: VirtualRoomInfo;
  onOpenVirtualRoomModal: () => void;
  onToggleVirtualRoom: () => void;
  onEnterVirtualRoom?: () => void;
  onLogout: () => void;
}

export const ProfessorScreen: React.FC<ProfessorScreenProps> = ({
  currentUser,
  activities,
  virtualRoom,
  onOpenVirtualRoomModal,
  onToggleVirtualRoom,
  onEnterVirtualRoom,
  onLogout
}) => {
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Presença em tempo real na Sala Virtual (abas do intérprete que entraram na sala).
  const attention = useRoomAttention(virtualRoom.accessCode, currentUser);
  const connectedStudents = attention.attendees.filter((a) => a.role === 'aluno').length;

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(virtualRoom.accessCode);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="flex flex-col w-full gap-5 pb-12">
      {/* Teacher Profile & Live Class Bar */}
      <div className="bg-[#0b1c30] text-white rounded-3xl p-5 shadow-lg relative overflow-hidden space-y-4">
        <div className="absolute -top-16 -right-16 w-52 h-52 bg-[#3a34d3] opacity-30 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-13 h-13 rounded-2xl object-cover ring-2 ring-[#3a34d3]"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#005d3e] rounded-full ring-2 ring-[#0b1c30]"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[18px] font-bold text-white leading-tight">
                  {currentUser.name}
                </h2>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-[#3a34d3] text-white rounded-full">
                  Docente
                </span>
              </div>
              <p className="text-[12px] text-[#c7c4d8]">
                {currentUser.subject || 'Matemática'} • {currentUser.room || 'Sala 04-B'} • Turma 3º Ano A
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-xl bg-[#ffdad3]/20 hover:bg-[#ffdad3]/30 text-[#ffdad3] text-[12px] font-bold transition-all active:scale-95 flex items-center gap-1 self-start sm:self-auto"
            title="Sair da conta"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Sair</span>
          </button>
        </div>

        {/* Live Class Stats Strip */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-center">
          <div className="bg-white/5 p-2.5 rounded-xl">
            <span className="text-[18px] font-extrabold text-[#6ffbbe] block">
              {connectedStudents}
            </span>
            <span className="text-[10px] text-[#c7c4d8] uppercase tracking-wider font-semibold">
              Alunos Conectados
            </span>
          </div>
          <div className="bg-white/5 p-2.5 rounded-xl">
            <span className="text-[18px] font-extrabold text-[#6ffbbe] block">
              {activities.length}
            </span>
            <span className="text-[10px] text-[#c7c4d8] uppercase tracking-wider font-semibold">
              Atividades Criadas
            </span>
          </div>
        </div>
      </div>

      {/* AUTONOMIA DA SALA VIRTUAL (Card de Acesso Rápido do Professor) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e5eeff] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                virtualRoom.isActive ? 'bg-[#005d3e] text-white shadow-sm' : 'bg-[#eff4ff] text-[#464555]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {virtualRoom.isActive ? 'video_camera_front' : 'videocam_off'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-bold text-[#0b1c30]">
                  {virtualRoom.roomName}
                </h3>
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    virtualRoom.isActive
                      ? 'bg-[#6ffbbe]/30 text-[#005236]'
                      : 'bg-[#f1f5f9] text-[#777587]'
                  }`}
                >
                  {virtualRoom.isActive ? 'Ao Vivo Agora' : 'Fechada'}
                </span>
              </div>
              <p className="text-[11px] text-[#464555] font-bold truncate max-w-xs">
                Código: <span className="font-mono">{virtualRoom.accessCode}</span>
              </p>
            </div>
          </div>

          {/* Action buttons for virtual room */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              onClick={handleCopyRoomCode}
              className="px-2.5 py-1.5 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#3a34d3] text-[11px] font-bold flex items-center gap-1 transition-all"
              title="Copiar código da sala"
            >
              <span className="material-symbols-outlined text-[14px]">
                {copiedLink ? 'check' : 'vpn_key'}
              </span>
              <span>{copiedLink ? 'Copiado' : 'Copiar Código'}</span>
            </button>

            <button
              onClick={onOpenVirtualRoomModal}
              className="px-3 py-1.5 rounded-xl bg-[#3a34d3] hover:bg-[#5452ec] text-white text-[11px] font-bold flex items-center gap-1 transition-all shadow-sm"
              title="Configurar ou Gerar novo código"
            >
              <span className="material-symbols-outlined text-[14px]">settings</span>
              <span>Gerenciar Sala</span>
            </button>

            <button
              onClick={onEnterVirtualRoom}
              className="px-3.5 py-1.5 rounded-xl bg-[#005d3e] hover:bg-[#007852] text-white text-[11px] font-bold flex items-center gap-1 transition-all shadow-sm active:scale-95"
              title="Abrir a Sala Virtual e entrar como Docente (Host)"
            >
              <span className="material-symbols-outlined text-[14px]">meeting_room</span>
              <span>Abrir a Sala</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};