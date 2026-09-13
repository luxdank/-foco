import React, { useState, useRef } from 'react';
import { TeacherActivity, AttachmentItem, AttachmentType } from '../types';

interface CreateActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveActivity: (activity: TeacherActivity) => void;
  defaultSubject?: string;
  teacherName?: string;
}

export const CreateActivityModal: React.FC<CreateActivityModalProps> = ({
  isOpen,
  onClose,
  onSaveActivity,
  defaultSubject = 'Matemática',
  teacherName = 'Prof. Ricardo Mendes'
}) => {
  const [title, setTitle] = useState<string>('');
  const [subject, setSubject] = useState<string>(defaultSubject);
  const [classGroup, setClassGroup] = useState<string>('3º Ano A');
  const [description, setDescription] = useState<string>('');
  const [deadline, setDeadline] = useState<string>('Hoje, 11:30');
  const [points, setPoints] = useState<number>(100);
  const [mode, setMode] = useState<'individual' | 'dupla' | 'grupo'>('dupla');

  // Attachments state
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [activeAttachmentTab, setActiveAttachmentTab] = useState<AttachmentType>('pdf');

  // Input states for adding attachment
  const [docTitle, setDocTitle] = useState<string>('');
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle PDF file upload
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    const newAtt: AttachmentItem = {
      id: `att-${Date.now()}`,
      type: 'pdf',
      title: docTitle.trim() || file.name,
      fileSize: `${sizeInMb} MB`,
      url: URL.createObjectURL(file)
    };
    setAttachments((prev) => [...prev, newAtt]);
    setDocTitle('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Preset PDF shortcut
  const handleAddPresetPdf = (name: string, size: string) => {
    const newAtt: AttachmentItem = {
      id: `att-${Date.now()}`,
      type: 'pdf',
      title: name,
      fileSize: size,
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    };
    setAttachments((prev) => [...prev, newAtt]);
  };

  // Handle Image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const sizeInKb = (file.size / 1024).toFixed(0);
      const newAtt: AttachmentItem = {
        id: `att-${Date.now()}`,
        type: 'image',
        title: docTitle.trim() || file.name,
        fileSize: `${sizeInKb} KB`,
        url: result,
        previewUrl: result
      };
      setAttachments((prev) => [...prev, newAtt]);
      setDocTitle('');
      setImagePreview(null);
      if (imgInputRef.current) imgInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  // Preset Image shortcut
  const handleAddPresetImage = (name: string, url: string) => {
    const newAtt: AttachmentItem = {
      id: `att-${Date.now()}`,
      type: 'image',
      title: name,
      fileSize: '540 KB',
      url,
      previewUrl: url
    };
    setAttachments((prev) => [...prev, newAtt]);
  };

  // Handle Link addition
  const handleAddLink = () => {
    if (!linkUrl.trim()) return;
    let formattedUrl = linkUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const newAtt: AttachmentItem = {
      id: `att-${Date.now()}`,
      type: 'link',
      title: docTitle.trim() || formattedUrl,
      url: formattedUrl
    };
    setAttachments((prev) => [...prev, newAtt]);
    setDocTitle('');
    setLinkUrl('');
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newActivity: TeacherActivity = {
      id: `act-${Date.now()}`,
      title: title.trim(),
      subject,
      teacherName,
      classGroup,
      description: description.trim() || 'Sem instruções adicionais.',
      deadline,
      points: Number(points) || 100,
      mode,
      attachments,
      createdAt: 'Agora mesmo',
      status: 'aberta'
    };

    onSaveActivity(newActivity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0b1c30]/55 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-[#e5eeff] my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#e5eeff] bg-[#f8f9ff] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#3a34d3] text-white flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[22px]">post_add</span>
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#3a34d3]">
                Painel do Docente
              </span>
              <h3 className="font-extrabold text-[17px] text-[#0b1c30]">
                Criar Atividade Personalizada
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold text-[#464555] uppercase tracking-wider mb-1">
              Título da Atividade *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Resolução de Prismas e Cilindros Oblíquos"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-[13px] px-3.5 py-2.5 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl focus:outline-none focus:border-[#3a34d3]"
            />
          </div>

          {/* Subject & Class Group */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#464555] uppercase tracking-wider mb-1">
                Disciplina
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-[13px] px-3 py-2.5 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl focus:outline-none focus:border-[#3a34d3]"
              >
                <option value="Matemática">Matemática</option>
                <option value="Física">Física</option>
                <option value="História">História</option>
                <option value="Biologia">Biologia</option>
                <option value="Língua Portuguesa">Língua Portuguesa</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#464555] uppercase tracking-wider mb-1">
                Turma
              </label>
              <input
                type="text"
                value={classGroup}
                onChange={(e) => setClassGroup(e.target.value)}
                placeholder="Ex: 3º Ano A"
                className="w-full text-[13px] px-3 py-2.5 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl focus:outline-none focus:border-[#3a34d3]"
              />
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-[11px] font-bold text-[#464555] uppercase tracking-wider mb-1">
              Orientações &amp; Enunciado
            </label>
            <textarea
              rows={3}
              placeholder="Descreva as instruções, questões ou capítulos do livro que os alunos devem resolver..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-[13px] px-3.5 py-2.5 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl focus:outline-none focus:border-[#3a34d3]"
            />
          </div>

          {/* Deadline, Points & Mode */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold text-[#464555] uppercase tracking-wider mb-1">
                Prazo
              </label>
              <input
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="Ex: Hoje, 11:30"
                className="w-full text-[12px] px-2.5 py-2 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl focus:outline-none focus:border-[#3a34d3]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#464555] uppercase tracking-wider mb-1">
                Pontos
              </label>
              <input
                type="number"
                min="0"
                max="1000"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="w-full text-[12px] px-2.5 py-2 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl focus:outline-none focus:border-[#3a34d3]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#464555] uppercase tracking-wider mb-1">
                Formato
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
                className="w-full text-[12px] px-2 py-2 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl focus:outline-none focus:border-[#3a34d3]"
              >
                <option value="dupla">Em Dupla</option>
                <option value="individual">Individual</option>
                <option value="grupo">Em Grupo</option>
              </select>
            </div>
          </div>

          {/* ATTACHMENTS SECTION (PDF, IMAGENS, LINKS) */}
          <div className="bg-[#eff4ff] p-4 rounded-2xl border border-[#dce9ff] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#3a34d3]">
                  attach_file
                </span>
                <span className="text-[12px] font-bold text-[#0b1c30]">
                  Anexar Materiais (PDF, Imagens e Links)
                </span>
              </div>
              <span className="text-[11px] font-bold text-[#3a34d3]">
                {attachments.length} anexo(s)
              </span>
            </div>

            {/* Sub-tabs for attachments */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#dce9ff]">
              <button
                type="button"
                onClick={() => setActiveAttachmentTab('pdf')}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                  activeAttachmentTab === 'pdf'
                    ? 'bg-[#3a34d3] text-white shadow-sm'
                    : 'text-[#464555] hover:text-[#0b1c30]'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">picture_as_pdf</span>
                <span>PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAttachmentTab('image')}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                  activeAttachmentTab === 'image'
                    ? 'bg-[#3a34d3] text-white shadow-sm'
                    : 'text-[#464555] hover:text-[#0b1c30]'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">image</span>
                <span>Imagem</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAttachmentTab('link')}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                  activeAttachmentTab === 'link'
                    ? 'bg-[#3a34d3] text-white shadow-sm'
                    : 'text-[#464555] hover:text-[#0b1c30]'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">link</span>
                <span>Link Web</span>
              </button>
            </div>

            {/* 1. PDF Tab Content */}
            {activeAttachmentTab === 'pdf' && (
              <div className="space-y-2.5 pt-1">
                <input
                  type="text"
                  placeholder="Título ou descrição do PDF (opcional)"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full text-[12px] px-3 py-2 bg-white rounded-xl border border-[#dce9ff] focus:outline-none focus:border-[#3a34d3]"
                />

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                    id="pdf-upload-input"
                  />
                  <label
                    htmlFor="pdf-upload-input"
                    className="flex-1 py-2 px-3 bg-white hover:bg-[#f8f9ff] border border-dashed border-[#3a34d3] text-[#3a34d3] rounded-xl text-[12px] font-bold text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">upload_file</span>
                    <span>Upload de PDF do Computador</span>
                  </label>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-[#464555] font-semibold">Exemplos Prontos:</span>
                  <button
                    type="button"
                    onClick={() => handleAddPresetPdf('Apostila_Exercicios_Prismas.pdf', '3.8 MB')}
                    className="text-[10px] font-bold text-[#3a34d3] bg-white px-2 py-0.5 rounded-md border border-[#dce9ff] hover:bg-[#dce9ff]"
                  >
                    + Apostila de Prismas
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPresetPdf('Gabarito_Comentado_Cap4.pdf', '1.2 MB')}
                    className="text-[10px] font-bold text-[#3a34d3] bg-white px-2 py-0.5 rounded-md border border-[#dce9ff] hover:bg-[#dce9ff]"
                  >
                    + Gabarito
                  </button>
                </div>
              </div>
            )}

            {/* 2. Image Tab Content */}
            {activeAttachmentTab === 'image' && (
              <div className="space-y-2.5 pt-1">
                <input
                  type="text"
                  placeholder="Legenda da imagem (ex: Diagrama do Cilindro Reto)"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full text-[12px] px-3 py-2 bg-white rounded-xl border border-[#dce9ff] focus:outline-none focus:border-[#3a34d3]"
                />

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={imgInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="img-upload-input"
                  />
                  <label
                    htmlFor="img-upload-input"
                    className="flex-1 py-2 px-3 bg-white hover:bg-[#f8f9ff] border border-dashed border-[#3a34d3] text-[#3a34d3] rounded-xl text-[12px] font-bold text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_photo_alternate</span>
                    <span>Carregar Foto ou Diagrama</span>
                  </label>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-[#464555] font-semibold">Diagramas:</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleAddPresetImage(
                        'Secao_Transversal_Cilindro.png',
                        'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80'
                      )
                    }
                    className="text-[10px] font-bold text-[#3a34d3] bg-white px-2 py-0.5 rounded-md border border-[#dce9ff] hover:bg-[#dce9ff]"
                  >
                    + Prisma 3D
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleAddPresetImage(
                        'Formula_Volume_Lousa.png',
                        'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&auto=format&fit=crop&q=80'
                      )
                    }
                    className="text-[10px] font-bold text-[#3a34d3] bg-white px-2 py-0.5 rounded-md border border-[#dce9ff] hover:bg-[#dce9ff]"
                  >
                    + Fórmulas Lousa
                  </button>
                </div>
              </div>
            )}

            {/* 3. Link Tab Content */}
            {activeAttachmentTab === 'link' && (
              <div className="space-y-2.5 pt-1">
                <input
                  type="text"
                  placeholder="Nome do link (ex: GeoGebra 3D / Vídeo Explicativo)"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full text-[12px] px-3 py-2 bg-white rounded-xl border border-[#dce9ff] focus:outline-none focus:border-[#3a34d3]"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="URL (ex: https://www.geogebra.org/3d)"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="flex-1 text-[12px] px-3 py-2 bg-white rounded-xl border border-[#dce9ff] focus:outline-none focus:border-[#3a34d3]"
                  />
                  <button
                    type="button"
                    onClick={handleAddLink}
                    disabled={!linkUrl.trim()}
                    className="px-3 py-2 bg-[#3a34d3] hover:bg-[#5452ec] disabled:opacity-40 text-white rounded-xl text-[12px] font-bold shrink-0 transition-all"
                  >
                    Adicionar
                  </button>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-[#464555] font-semibold">Links Rápidos:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setDocTitle('GeoGebra 3D Interativo');
                      setLinkUrl('https://www.geogebra.org/3d');
                    }}
                    className="text-[10px] font-bold text-[#3a34d3] bg-white px-2 py-0.5 rounded-md border border-[#dce9ff]"
                  >
                    GeoGebra
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDocTitle('Simulador PhET');
                      setLinkUrl('https://phet.colorado.edu/pt_BR');
                    }}
                    className="text-[10px] font-bold text-[#3a34d3] bg-white px-2 py-0.5 rounded-md border border-[#dce9ff]"
                  >
                    PhET
                  </button>
                </div>
              </div>
            )}

            {/* List of Attached Items */}
            {attachments.length > 0 && (
              <div className="pt-2 border-t border-[#dce9ff] space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#464555] block">
                  Itens anexados que os alunos receberão:
                </span>
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#dce9ff] gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#eff4ff] text-[#3a34d3] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[16px]">
                          {att.type === 'pdf'
                            ? 'picture_as_pdf'
                            : att.type === 'image'
                            ? 'image'
                            : 'link'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-bold text-[#0b1c30] truncate">
                          {att.title}
                        </p>
                        <p className="text-[10px] text-[#777587]">
                          {att.type.toUpperCase()} {att.fileSize ? `• ${att.fileSize}` : ''}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="w-6 h-6 rounded-full hover:bg-[#ffdad3]/50 text-[#b22200] flex items-center justify-center shrink-0"
                      title="Remover anexo"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-[#f1f5f9] flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#464555] font-bold text-[13px] transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-[#3a34d3] hover:bg-[#5452ec] text-white font-bold text-[13px] flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">publish</span>
              <span>Publicar Atividade</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
