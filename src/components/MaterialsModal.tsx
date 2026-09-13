import React, { useState } from 'react';
import { Subject, TeacherActivity, AttachmentItem } from '../types';

interface MaterialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject | null;
  activities?: TeacherActivity[];
}

export const MaterialsModal: React.FC<MaterialsModalProps> = ({
  isOpen,
  onClose,
  subject,
  activities = []
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!isOpen || !subject) return null;

  // Filter attachments from activities belonging to this subject
  const subjectActivities = activities.filter(
    (act) => act.subject.toLowerCase() === subject.name.toLowerCase()
  );
  const teacherAttachments: { activityTitle: string; item: AttachmentItem }[] = [];
  subjectActivities.forEach((act) => {
    act.attachments.forEach((att) => {
      teacherAttachments.push({ activityTitle: act.title, item: att });
    });
  });

  const baseMaterials = [
    {
      title: `Apostila Bimestral Oficial — ${subject.name}`,
      size: '4.2 MB',
      type: 'PDF',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      title: `Síntese de Aula & Exercícios Resolvidos`,
      size: '12.8 MB',
      type: 'SLIDES',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#0b1c30]/55 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#e5eeff] bg-[#f8f9ff] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#eff4ff] text-[#3a34d3] flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[24px]">folder_open</span>
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#3a34d3]">
                {subject.category}
              </span>
              <h3 className="font-extrabold text-[17px] text-[#0b1c30]">
                Materiais: {subject.name}
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
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Teacher identification */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#eff4ff] text-[13px] text-[#0b1c30]">
            <img
              src={subject.teacher.avatar}
              alt={subject.teacher.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-[#dce9ff]"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="font-bold block">{subject.teacher.name}</span>
              <span className="text-[11px] text-[#464555]">
                {subject.room} • Envios e materiais didáticos atualizados
              </span>
            </div>
          </div>

          {/* Teacher Uploaded Section (PDFs, Images, Links) */}
          {teacherAttachments.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#3a34d3] block">
                Envios Recentes do Professor ({teacherAttachments.length})
              </span>
              <div className="space-y-2">
                {teacherAttachments.map(({ activityTitle, item }) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl border border-[#dce9ff] bg-[#f8f9ff] hover:bg-[#eff4ff] transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          item.type === 'pdf'
                            ? 'bg-[#ffdad3] text-[#b22200]'
                            : item.type === 'image'
                            ? 'bg-[#e2dfff] text-[#3a34d3]'
                            : 'bg-[#6ffbbe]/40 text-[#005236]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {item.type === 'pdf'
                            ? 'picture_as_pdf'
                            : item.type === 'image'
                            ? 'image'
                            : 'link'}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-[#0b1c30] truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-[#777587] truncate">
                          {item.type.toUpperCase()} {item.fileSize ? `• ${item.fileSize}` : ''} • Ref: {activityTitle}
                        </p>
                      </div>
                    </div>

                    {/* Action button */}
                    {item.type === 'pdf' && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-white border border-[#dce9ff] text-[#b22200] font-bold text-[11px] flex items-center gap-1 hover:bg-[#ffdad3]/30 transition-all shrink-0"
                      >
                        <span className="material-symbols-outlined text-[14px]">download</span>
                        <span>Baixar</span>
                      </a>
                    )}

                    {item.type === 'image' && (
                      <button
                        onClick={() => setPreviewImage(item.previewUrl || item.url)}
                        className="px-3 py-1.5 rounded-xl bg-white border border-[#dce9ff] text-[#3a34d3] font-bold text-[11px] flex items-center gap-1 hover:bg-[#dce9ff] transition-all shrink-0"
                      >
                        <span className="material-symbols-outlined text-[14px]">zoom_in</span>
                        <span>Ver</span>
                      </button>
                    )}

                    {item.type === 'link' && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-white border border-[#dce9ff] text-[#005d3e] font-bold text-[11px] flex items-center gap-1 hover:bg-[#6ffbbe]/20 transition-all shrink-0"
                      >
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        <span>Acessar</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Standard Course Materials */}
          <div className="space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#464555] block">
              Materiais da Grade Escolar
            </span>
            <div className="space-y-2">
              {baseMaterials.map((mat, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl border border-[#e5eeff] bg-[#f8f9ff] hover:bg-[#eff4ff] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#eff4ff] text-[#3a34d3] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">
                        {mat.type === 'PDF' ? 'picture_as_pdf' : 'slideshow'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-[#0b1c30] truncate">
                        {mat.title}
                      </p>
                      <span className="text-[11px] text-[#777587]">
                        {mat.type} • {mat.size}
                      </span>
                    </div>
                  </div>
                  <a
                    href={mat.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-[#3a34d3] hover:bg-[#e2dfff] rounded-xl transition-colors shrink-0"
                    title="Baixar material"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f8f9ff] border-t border-[#e5eeff] flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#3a34d3] text-white text-[13px] font-bold hover:bg-[#5452ec] shadow-sm transition-all"
          >
            Concluir
          </button>
        </div>
      </div>

      {/* Image Preview Lightbox */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[60] bg-black/85 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="bg-white rounded-2xl p-2 max-w-lg max-h-[85vh] overflow-hidden">
            <img
              src={previewImage}
              alt="Visualização do Material"
              className="w-full h-auto max-h-[75vh] object-contain rounded-xl"
            />
            <div className="p-3 text-center">
              <button
                onClick={() => setPreviewImage(null)}
                className="px-4 py-1.5 rounded-xl bg-[#3a34d3] text-white text-[12px] font-bold"
              >
                Fechar Foto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
