import React, { useState, useEffect } from 'react';
import { VirtualRoomInfo } from '../types';

interface VirtualRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoom: VirtualRoomInfo;
  onSaveRoom: (room: VirtualRoomInfo, notifyStudents: boolean) => void;
  onEnterNativeRoom?: () => void;
}

export const VirtualRoomModal: React.FC<VirtualRoomModalProps> = ({
  isOpen,
  onClose,
  currentRoom,
  onSaveRoom,
  onEnterNativeRoom
}) => {
  const [roomName, setRoomName] = useState<string>(currentRoom.roomName);
  const [accessCode, setAccessCode] = useState<string>(currentRoom.accessCode);
  const [presentationMode, setPresentationMode] = useState<'lousa' | 'slides' | 'camera'>(
    currentRoom.presentationMode || 'lousa'
  );
  const [topicDescription, setTopicDescription] = useState<string>(
    currentRoom.topicDescription || 'Resolução prática e monitoria de dúvidas com o professor.'
  );
  const [isActive, setIsActive] = useState<boolean>(currentRoom.isActive);

  // Mantém o modal sincronizado quando o código da sala muda (ex: professor fechou
  // a sala → novo código gerado automaticamente).
  useEffect(() => {
    setRoomName(currentRoom.roomName);
    setAccessCode(currentRoom.accessCode);
    setPresentationMode(currentRoom.presentationMode || 'lousa');
    setTopicDescription(
      currentRoom.topicDescription || 'Resolução prática e monitoria de dúvidas com o professor.'
    );
    setIsActive(currentRoom.isActive);
  }, [currentRoom]);

  if (!isOpen) return null;

  const handleGenerateNewCode = () => {
    return (
      'FOCO-' + Math.random().toString(36).substring(2, 5).toUpperCase() + '-' + Math.floor(10 + Math.random() * 90)
    );
  };

  const handleSave = (notify = false, andEnter = false) => {
    const updated: VirtualRoomInfo = {
      ...currentRoom,
      roomName,
      accessCode,
      nativeLink: `https://foco.app/sala/${accessCode}`,
      platform: 'foco_live',
      topicDescription,
      isActive,
      presentationMode,
      startedAt: isActive
        ? currentRoom.startedAt ||
          new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        : undefined
    };
    onSaveRoom(updated, notify);
    onClose();

    if (andEnter && onEnterNativeRoom) {
      onEnterNativeRoom();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0b1c30]/65 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-[#e5eeff] max-h-[92vh] flex flex-col my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#e5eeff] bg-[#f8f9ff] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#005d3e] text-white flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[22px]">video_camera_front</span>
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#005d3e]">
                100% NATIVO +Foco
              </span>
              <h3 className="font-extrabold text-[16px] sm:text-[17px] text-[#0b1c30]">
                Gerar Sala Virtual Nativa
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#eff4ff] hover:bg-[#dce9ff] flex items-center justify-center text-[#464555] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Status Switcher Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
              isActive
                ? 'bg-[#6ffbbe]/20 border-[#6ffbbe]'
                : 'bg-[#f8f9ff] border-[#e5eeff]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`w-3 h-3 rounded-full ${
                  isActive ? 'bg-[#005d3e] animate-ping' : 'bg-[#c7c4d8]'
                }`}
              ></span>
              <div>
                <span className="text-[13px] font-bold text-[#0b1c30] block">
                  {isActive ? 'Sala Nativa Aberta (Ao Vivo)' : 'Sala Nativa Inativa'}
                </span>
                <span className="text-[11px] text-[#464555]">
                  {isActive
                    ? 'Alunos entram diretamente com seus perfis no app'
                    : 'Transmissão pausada para a turma'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`px-3 py-1.5 rounded-xl font-bold text-[12px] transition-all shrink-0 ${
                isActive
                  ? 'bg-[#b22200] text-white hover:bg-[#8f1b00]'
                  : 'bg-[#005d3e] text-white hover:bg-[#007852]'
              }`}
            >
              {isActive ? 'Pausar Sala' : 'Ativar Sala'}
            </button>
          </div>

          {/* Room Name & Presentation Mode */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-[#464555] uppercase tracking-wider mb-1">
                Nome da Sala
              </label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full text-[13px] px-3.5 py-2.5 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl focus:outline-none focus:border-[#3a34d3]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#464555] uppercase tracking-wider mb-1">
                  Código da Turma
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    className="flex-1 min-w-0 text-[13px] font-mono font-bold px-3 py-2.5 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl focus:outline-none focus:border-[#3a34d3]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setAccessCode(handleGenerateNewCode());
                    }}
                    className="shrink-0 px-2.5 py-2.5 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#3a34d3] font-bold text-[11px] flex items-center gap-1 transition-all"
                    title="Gerar um novo código para a turma"
                  >
                    <span className="material-symbols-outlined text-[15px]">refresh</span>
                    <span className="hidden sm:inline">Novo Código</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#464555] uppercase tracking-wider mb-1">
                  Modo de Abertura
                </label>
                <select
                  value={presentationMode}
                  onChange={(e) => setPresentationMode(e.target.value as any)}
                  className="w-full text-[13px] px-3 py-2.5 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl focus:outline-none focus:border-[#3a34d3]"
                >
                  <option value="lousa">Quadro / Lousa Digital</option>
                  <option value="slides">Slides &amp; Material</option>
                  <option value="camera">Câmera do Professor</option>
                </select>
              </div>
            </div>

            {/* Pauta / Tópico */}
            <div>
              <label className="block text-[11px] font-bold text-[#464555] uppercase tracking-wider mb-1">
                Tópico ou Pauta da Sessão
              </label>
              <input
                type="text"
                value={topicDescription}
                onChange={(e) => setTopicDescription(e.target.value)}
                placeholder="Ex: Resolução de Geometria Espacial e dúvidas nas mesas"
                className="w-full text-[13px] px-3.5 py-2.5 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl focus:outline-none focus:border-[#3a34d3]"
              />
            </div>
          </div>
        </div>

        {/* Footer / Actions */}
        <div className="p-4 bg-[#f8f9ff] border-t border-[#e5eeff] flex flex-col gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsActive(true);
              handleSave(true, true);
            }}
            className="w-full py-3 px-4 rounded-xl bg-[#005d3e] hover:bg-[#007852] text-white font-bold text-[13px] flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">meeting_room</span>
            <span>Abrir a Sala e Entrar (Host)</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave(false, false)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#3a34d3] font-bold text-[12px] transition-all"
            >
              Salvar Alterações
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-white border border-[#dce9ff] text-[#464555] font-bold text-[12px] hover:bg-[#f1f5f9] transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
