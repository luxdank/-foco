import React, { useState } from 'react';
import { UserProfile } from '../types';
import { DIRECT_IMAGE_ASSETS } from '../data/mockData';
import { ambientSound } from '../utils/soundGenerator';

interface EuScreenProps {
  currentUser: UserProfile;
  onOpenImageGallery: () => void;
  onLogout: () => void;
}

export const EuScreen: React.FC<EuScreenProps> = ({
  currentUser,
  onOpenImageGallery,
  onLogout
}) => {
  const [silentNotifications, setSilentNotifications] = useState<boolean>(true);
  const [focusAudio, setFocusAudio] = useState<boolean>(ambientSound.getIsPlaying());
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleToggleFocusAudio = () => {
    const active = ambientSound.toggle('rain');
    setFocusAudio(active);
  };

  return (
    <div className="flex flex-col w-full gap-5 pb-12">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5eeff] flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
        <div className="relative">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-[#e2dfff] shadow-md"
            referrerPolicy="no-referrer"
          />
          <span className="absolute bottom-1 right-1 w-4 h-4 bg-[#005d3e] rounded-full ring-2 ring-white"></span>
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h2 className="text-[20px] font-extrabold text-[#0b1c30]">{currentUser.name}</h2>
            <span className="text-[11px] font-bold text-[#3a34d3] bg-[#eff4ff] px-2.5 py-1 rounded-full border border-[#c1c1ff] self-center sm:self-auto">
              {currentUser.classGroup || '3º Ano A'} • Escola Modelo
            </span>
          </div>
          <p className="text-[13px] text-[#464555]">
            {currentUser.details}
          </p>
          <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 text-[12px] text-[#005d3e] font-semibold">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>Conta ativa no Portal +Foco</span>
          </div>
        </div>
      </div>

      {/* Logout Quick Bar */}
      <div className="grid grid-cols-1 gap-2.5">
        <button
          onClick={onLogout}
          className="p-3 rounded-xl bg-white hover:bg-[#ffdad3]/30 text-[#b22200] font-bold text-[12px] flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-[#ffdad3]"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span>Trocar Usuário / Sair</span>
        </button>
      </div>

      {/* Estatísticas de Foco */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white rounded-xl p-3.5 border border-[#e5eeff] text-center space-y-0.5">
          <span className="text-[22px] font-extrabold text-[#b22200] block">4 dias</span>
          <span className="text-[11px] font-bold text-[#464555] uppercase tracking-wider">
            Ofensiva 🔥
          </span>
        </div>
        <div className="bg-white rounded-xl p-3.5 border border-[#e5eeff] text-center space-y-0.5">
          <span className="text-[22px] font-extrabold text-[#3a34d3] block">18.5 h</span>
          <span className="text-[11px] font-bold text-[#464555] uppercase tracking-wider">
            Foco Semanal
          </span>
        </div>
        <div className="bg-white rounded-xl p-3.5 border border-[#e5eeff] text-center space-y-0.5">
          <span className="text-[22px] font-extrabold text-[#005d3e] block">88%</span>
          <span className="text-[11px] font-bold text-[#464555] uppercase tracking-wider">
            Presença
          </span>
        </div>
        <div className="bg-white rounded-xl p-3.5 border border-[#e5eeff] text-center space-y-0.5">
          <span className="text-[22px] font-extrabold text-[#d73b19] block">14</span>
          <span className="text-[11px] font-bold text-[#464555] uppercase tracking-wider">
            Tarefas Entregues
          </span>
        </div>
      </div>

      {/* Destaque Especial: Links Diretos para Imagens do HTML */}
      <div className="bg-gradient-to-br from-[#eff4ff] to-[#e2dfff] rounded-2xl p-5 border border-[#c1c1ff] shadow-sm space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#3a34d3] text-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[22px]">link</span>
            </div>
            <div>
              <h3 className="text-[16px] font-extrabold text-[#0b1c30]">
                Links Diretos para as Imagens do HTML
              </h3>
              <p className="text-[12px] text-[#464555]">
                URLs oficiais de CDN prontas para uso direto em tags &lt;img&gt;
              </p>
            </div>
          </div>
        </div>

        <p className="text-[13px] text-[#0b1c30] leading-relaxed bg-white/70 p-3 rounded-xl border border-[#dce9ff]">
          <strong>Resposta ao seu pedido:</strong> É perfeitamente possível utilizar links diretos! Todas as fotos dos professores, avatares de alunos e o logotipo +Foco funcionam com URLs diretas na nuvem.
        </p>

        <div className="flex flex-col gap-2 pt-1">
          {DIRECT_IMAGE_ASSETS.slice(0, 3).map((asset) => (
            <div
              key={asset.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#e5eeff] gap-2"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={asset.url}
                  alt={asset.title}
                  className="w-8 h-8 rounded-lg object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-[#0b1c30] truncate">
                    {asset.title}
                  </p>
                  <p className="text-[10px] font-mono text-[#777587] truncate">
                    {asset.url}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleCopy(asset.url)}
                className="px-2.5 py-1 rounded-md bg-[#eff4ff] hover:bg-[#dce9ff] text-[#3a34d3] text-[11px] font-bold shrink-0 flex items-center gap-1 transition-all"
              >
                <span className="material-symbols-outlined text-[13px]">
                  {copiedUrl === asset.url ? 'check' : 'content_copy'}
                </span>
                <span>{copiedUrl === asset.url ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={onOpenImageGallery}
          className="w-full py-2.5 px-4 rounded-xl bg-[#3a34d3] hover:bg-[#5452ec] text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm mt-1"
        >
          <span className="material-symbols-outlined text-[18px]">collections</span>
          <span>Abrir Galeria Completa &amp; Copiador de HTML</span>
        </button>
      </div>

      {/* Configurações do App */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e5eeff] space-y-3">
        <h3 className="text-[15px] font-bold text-[#0b1c30]">Preferências de Estudo</h3>

        <div className="flex items-center justify-between py-1">
          <div>
            <span className="text-[13px] font-semibold text-[#0b1c30] block">
              Silenciar Notificações Sociais em Aula
            </span>
            <span className="text-[11px] text-[#777587]">
              Ativação automática durante o modo foco
            </span>
          </div>
          <button
            onClick={() => setSilentNotifications(!silentNotifications)}
            className={`w-12 h-7 rounded-full p-1 transition-colors ${
              silentNotifications ? 'bg-[#3a34d3]' : 'bg-[#c7c4d8]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                silentNotifications ? 'translate-x-5' : 'translate-x-0'
              }`}
            ></div>
          </button>
        </div>

        <div className="flex items-center justify-between py-1 border-t border-[#f1f5f9]">
          <div>
            <span className="text-[13px] font-semibold text-[#0b1c30] block">
              Som Ambiente de Concentração (Áudio Real)
            </span>
            <span className="text-[11px] text-[#777587]">
              {focusAudio ? 'Chuva suave tocando nos fones' : 'Clique para ligar áudio de foco'}
            </span>
          </div>
          <button
            onClick={handleToggleFocusAudio}
            className={`w-12 h-7 rounded-full p-1 transition-colors ${
              focusAudio ? 'bg-[#3a34d3]' : 'bg-[#c7c4d8]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                focusAudio ? 'translate-x-5' : 'translate-x-0'
              }`}
            ></div>
          </button>
        </div>
      </div>
    </div>
  );
};
