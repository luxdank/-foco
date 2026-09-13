import React, { useState } from 'react';
import { SUBJECTS_DATA } from '../data/mockData';
import { Subject, TabType, TeacherActivity, VirtualRoomInfo } from '../types';

interface SalasScreenProps {
  onNavigate: (tab: TabType) => void;
  onOpenMaterials: (subject: Subject) => void;
  activities?: TeacherActivity[];
  virtualRoom?: VirtualRoomInfo;
  onEnterVirtualRoom?: () => void;
}

export const SalasScreen: React.FC<SalasScreenProps> = ({
  onNavigate,
  onOpenMaterials,
  activities = [],
  virtualRoom,
  onEnterVirtualRoom
}) => {
  const [activeFilter, setActiveFilter] = useState<'todas' | 'hoje' | 'pendentes'>('todas');
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);

  const filteredSubjects = SUBJECTS_DATA.filter((sub) => {
    if (activeFilter === 'hoje') {
      return sub.id === 'matematica' || sub.id === 'fisica';
    }
    if (activeFilter === 'pendentes') {
      return sub.pendingTask || sub.groupProject;
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full gap-5 pb-8">
      {/* Sub-header with Warm Greeting & Overview */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-[#3a34d3] text-[26px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_stories
            </span>
            <h1 className="text-[26px] font-bold text-[#0b1c30] tracking-tight">
              Suas Disciplinas
            </h1>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#dce9ff] rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#005d3e] animate-pulse"></span>
            <span className="text-[11px] text-[#464555] font-bold">5 Matérias ativas</span>
          </div>
        </div>
        <p className="text-[13px] text-[#464555]">
          Acompanhe salas virtuais criadas pelos professores, prazos e atividades com anexos.
        </p>
      </div>

      {/* SALA VIRTUAL AO VIVO (Criada pelo Professor) */}
      {virtualRoom && virtualRoom.isActive && (
        <div className="bg-gradient-to-r from-[#005d3e] via-[#00472f] to-[#0b1c30] text-white p-4 sm:p-5 rounded-3xl shadow-lg border border-[#6ffbbe]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#6ffbbe]/20 text-[#6ffbbe] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[26px] animate-pulse">
                video_camera_front
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#6ffbbe] text-[#005236]">
                  SALA VIRTUAL ABERTA
                </span>
                <span className="text-[11px] text-[#c7c4d8] font-mono">
                  Código: {virtualRoom.accessCode}
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

      {/* Interactive Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5" id="subject-filter-tabs">
        <button
          onClick={() => setActiveFilter('todas')}
          className={`px-4 py-2 rounded-full text-[13px] transition-all shadow-sm active:scale-95 ${
            activeFilter === 'todas'
              ? 'bg-[#3a34d3] text-white font-bold'
              : 'bg-[#e5eeff] text-[#464555] hover:bg-[#dce9ff]'
          }`}
        >
          Todas (5)
        </button>
        <button
          onClick={() => setActiveFilter('hoje')}
          className={`px-4 py-2 rounded-full text-[13px] transition-all shadow-sm active:scale-95 flex items-center gap-1.5 ${
            activeFilter === 'hoje'
              ? 'bg-[#3a34d3] text-white font-bold'
              : 'bg-[#e5eeff] text-[#464555] hover:bg-[#dce9ff]'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#b22200]"></span>
          <span>Com aula hoje (2)</span>
        </button>
        <button
          onClick={() => setActiveFilter('pendentes')}
          className={`px-4 py-2 rounded-full text-[13px] transition-all shadow-sm active:scale-95 flex items-center gap-1.5 ${
            activeFilter === 'pendentes'
              ? 'bg-[#3a34d3] text-white font-bold'
              : 'bg-[#e5eeff] text-[#464555] hover:bg-[#dce9ff]'
          }`}
        >
          <span className="material-symbols-outlined text-[15px] text-[#ba1a1a]">
            assignment_late
          </span>
          <span>Atividades pendentes ({activities.length})</span>
        </button>
      </div>

      {/* Cards Stack */}
      <div className="flex flex-col gap-4" id="cards-container">
        {filteredSubjects.map((sub) => {
          const isMatematica = sub.id === 'matematica';
          // Find custom teacher activities for this subject
          const subjectActivities = activities.filter(
            (act) => act.subject.toLowerCase() === sub.name.toLowerCase()
          );

          return (
            <div
              key={sub.id}
              className="flex flex-col bg-white rounded-2xl p-5 shadow-[0_8px_24px_-4px_rgba(84,82,236,0.06)] border border-[#e5eeff] relative overflow-hidden transition-all duration-300 hover:shadow-lg"
            >
              {/* Top Accent Strip */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: sub.themeColor }}
              ></div>

              {/* Top Bar: Subject Badge + Status */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shadow-inner shrink-0"
                    style={{
                      backgroundColor: isMatematica ? '#e2dfff' : '#f1f5f9',
                      color: sub.themeColor
                    }}
                  >
                    <span className="material-symbols-outlined text-[24px]">
                      {sub.iconName}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span
                      className="text-[10px] uppercase tracking-wider font-extrabold"
                      style={{ color: sub.themeColor }}
                    >
                      {sub.category}
                    </span>
                    <h2 className="text-[18px] font-bold text-[#0b1c30] truncate">
                      {sub.name}
                    </h2>
                  </div>
                </div>

                {/* Live Badge Pulsing or Schedule */}
                {sub.isLiveNow ? (
                  <div className="flex items-center gap-1.5 bg-[#6ffbbe] text-[#002113] px-2.5 py-1 rounded-full shadow-sm shrink-0">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#005d3e] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#005d3e]"></span>
                    </span>
                    <span className="text-[11px] font-extrabold">Ao vivo agora</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 bg-[#e5eeff] text-[#464555] px-2.5 py-1 rounded-full shadow-sm shrink-0">
                    <span className="material-symbols-outlined text-[14px] text-[#3a34d3]">
                      {sub.schedule.includes(':') ? 'schedule' : 'calendar_today'}
                    </span>
                    <span className="text-[11px] font-bold">{sub.schedule}</span>
                  </div>
                )}
              </div>

              {/* Teacher Info */}
              <div className="flex items-center gap-2.5 py-2.5 px-3 bg-[#f8f9ff] rounded-xl border border-[#e5eeff] mb-3">
                <img
                  src={sub.teacher.avatar}
                  alt={sub.teacher.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-[#dce9ff]"
                  referrerPolicy="no-referrer"
                />
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-[#0b1c30] truncate">
                      {sub.teacher.name}
                    </p>
                    <p className="text-[11px] text-[#777587] truncate">{sub.room}</p>
                  </div>
                  <button
                    onClick={() => onOpenMaterials(sub)}
                    className="text-[11px] font-bold text-[#3a34d3] hover:underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">folder_open</span>
                    <span>Materiais</span>
                  </button>
                </div>
              </div>

              {/* Custom Teacher Activities with Attachments (PDFs, Images, Links) */}
              {subjectActivities.length > 0 && (
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#3a34d3] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">assignment</span>
                      <span>Atividade Personalizada pelo Professor</span>
                    </span>
                    <span className="text-[10px] font-bold text-[#005d3e] bg-[#6ffbbe]/30 px-2 py-0.5 rounded-full">
                      {subjectActivities[0].points} pts
                    </span>
                  </div>

                  {subjectActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-3.5 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-[13px] font-bold text-[#0b1c30]">
                          {act.title}
                        </h4>
                        <span className="text-[10px] font-bold text-[#777587] shrink-0">
                          {act.deadline}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#464555] line-clamp-2">
                        {act.description}
                      </p>

                      {/* Attachments Section (PDF, Image, Link) */}
                      {act.attachments && act.attachments.length > 0 && (
                        <div className="space-y-1.5 pt-1 border-t border-[#e5eeff]">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#777587] block">
                            Anexos do Professor ({act.attachments.length}):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {act.attachments.map((att) => (
                              <div
                                key={att.id}
                                className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#dce9ff] gap-2"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    className={`material-symbols-outlined text-[16px] shrink-0 ${
                                      att.type === 'pdf'
                                        ? 'text-[#b22200]'
                                        : att.type === 'image'
                                        ? 'text-[#3a34d3]'
                                        : 'text-[#005d3e]'
                                    }`}
                                  >
                                    {att.type === 'pdf'
                                      ? 'picture_as_pdf'
                                      : att.type === 'image'
                                      ? 'image'
                                      : 'link'}
                                  </span>
                                  <span className="text-[11px] font-medium text-[#0b1c30] truncate">
                                    {att.title}
                                  </span>
                                </div>

                                {att.type === 'pdf' && (
                                  <a
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] font-bold text-[#b22200] hover:underline shrink-0 flex items-center gap-0.5"
                                  >
                                    <span>PDF</span>
                                    <span className="material-symbols-outlined text-[12px]">download</span>
                                  </a>
                                )}

                                {att.type === 'image' && (
                                  <button
                                    onClick={() => setSelectedPreviewImage(att.previewUrl || att.url)}
                                    className="text-[10px] font-bold text-[#3a34d3] hover:underline shrink-0 flex items-center gap-0.5"
                                  >
                                    <span>Ver</span>
                                    <span className="material-symbols-outlined text-[12px]">visibility</span>
                                  </button>
                                )}

                                {att.type === 'link' && (
                                  <a
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] font-bold text-[#005d3e] hover:underline shrink-0 flex items-center gap-0.5"
                                  >
                                    <span>Abrir</span>
                                    <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Progress Section */}
              <div className="flex flex-col gap-1.5 mb-4">
                <div className="flex justify-between items-center text-[12px]">
                  <span className="text-[#464555] font-medium">Progresso do Bimestre</span>
                  <span className="text-[#0b1c30] font-bold flex items-center gap-1">
                    {sub.progress >= 90 && (
                      <span className="material-symbols-outlined text-[15px] text-[#005d3e]">
                        check_circle
                      </span>
                    )}
                    <span style={{ color: sub.progress >= 90 ? '#005d3e' : '#3a34d3' }}>
                      {sub.progressLabel || `${sub.progress}%`}
                    </span>
                  </span>
                </div>
                <div className="w-full h-2 bg-[#dce9ff] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${sub.progress}%`,
                      backgroundColor: sub.progress >= 90 ? '#007852' : sub.themeColor
                    }}
                  ></div>
                </div>
              </div>

              {/* Card Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                {isMatematica ? (
                  <button
                    onClick={() => onNavigate('foco-ativo')}
                    className="flex-1 h-12 bg-[#3a34d3] hover:bg-[#5452ec] text-white rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(58,52,211,0.25)] active:scale-[0.98] transition-all"
                  >
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      videocam
                    </span>
                    <span>Acessar Sala Ao Vivo</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigate('foco-ativo')}
                    className="flex-1 h-12 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#3a34d3] font-bold rounded-xl text-[14px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      meeting_room
                    </span>
                    <span>Acessar Sala</span>
                  </button>
                )}

                <button
                  onClick={() => onOpenMaterials(sub)}
                  className="h-12 px-3.5 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] rounded-xl flex items-center justify-center transition-colors active:scale-95 border border-[#dce9ff]"
                  title="Ver Materiais"
                >
                  <span className="material-symbols-outlined text-[20px] text-[#464555]">
                    folder_open
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Encouraging Footer Note */}
      <div className="bg-[#eff4ff] border border-[#dce9ff] rounded-2xl p-4 flex items-center gap-3.5 mt-1">
        <div className="w-10 h-10 rounded-full bg-[#6ffbbe] text-[#002113] flex items-center justify-center shrink-0 shadow-sm">
          <span className="material-symbols-outlined text-[22px]">celebration</span>
        </div>
        <div className="flex flex-col min-w-0">
          <p className="text-[13px] font-bold text-[#0b1c30]">
            Excelente ritmo esta semana!
          </p>
          <p className="text-[12px] text-[#464555]">
            Materiais e salas virtuais são atualizados em tempo real pelos seus professores.
          </p>
        </div>
      </div>

      {/* Lightbox Preview Modal for Attached Images */}
      {selectedPreviewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedPreviewImage(null)}
        >
          <div className="relative max-w-xl max-h-[85vh] bg-white rounded-2xl overflow-hidden p-2">
            <img
              src={selectedPreviewImage}
              alt="Preview do Anexo"
              className="w-full h-auto max-h-[75vh] object-contain rounded-xl"
            />
            <div className="p-3 text-center">
              <button
                onClick={() => setSelectedPreviewImage(null)}
                className="px-4 py-1.5 rounded-xl bg-[#3a34d3] text-white text-[12px] font-bold"
              >
                Fechar Imagem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
