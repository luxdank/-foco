import React, { useState } from 'react';
import { DIRECT_IMAGE_ASSETS } from '../data/mockData';
import { ImageAssetInfo } from '../types';

interface ImageLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImageLinksModal: React.FC<ImageLinksModalProps> = ({ isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = [
    { id: 'todas', label: 'Todas as Imagens' },
    { id: 'logo', label: 'Logo & Identidade' },
    { id: 'perfil', label: 'Estudante' },
    { id: 'professores', label: 'Professores' },
    { id: 'colegas', label: 'Colegas' },
  ];

  const filteredAssets =
    selectedCategory === 'todas'
      ? DIRECT_IMAGE_ASSETS
      : DIRECT_IMAGE_ASSETS.filter((item) => item.category === selectedCategory);

  const handleCopy = (text: string, id: string, type: 'url' | 'html') => {
    navigator.clipboard.writeText(text);
    setCopiedId(`${id}-${type}`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0b1c30]/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-2xl max-h-[90vh] rounded-t-2xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#e5eeff] flex items-center justify-between bg-[#f8f9ff]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#e2dfff] text-[#3a34d3] flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">link</span>
            </div>
            <div>
              <h2 className="font-bold text-[18px] text-[#0b1c30]">
                Links Diretos das Imagens do HTML
              </h2>
              <p className="text-[12px] text-[#464555]">
                URLs originais e tags HTML prontas para uso direto
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#eff4ff] hover:bg-[#dce9ff] flex items-center justify-center text-[#464555] transition-colors"
            aria-label="Fechar"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Informative Banner */}
        <div className="bg-[#eff4ff] px-5 py-3 border-b border-[#dce9ff] text-[13px] text-[#0b1c30] flex items-start gap-2.5">
          <span className="material-symbols-outlined text-[#3a34d3] text-[20px] mt-0.5 shrink-0">
            check_circle
          </span>
          <div>
            <strong>Sim!</strong> É possível utilizar links diretos em qualquer tag{' '}
            <code className="bg-white px-1.5 py-0.5 rounded text-[#3a34d3] font-mono text-[11px] border border-[#c1c1ff]">
              &lt;img src=&quot;...&quot; /&gt;
            </code>
            . Todas as imagens abaixo estão ativas neste aplicativo.
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-5 pt-3 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar border-b border-[#f1f5f9]">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-[#3a34d3] text-white shadow-sm'
                  : 'bg-[#eff4ff] text-[#464555] hover:bg-[#dce9ff]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* List of Image Assets */}
        <div className="p-5 overflow-y-auto space-y-4 max-h-[60vh]">
          {filteredAssets.map((asset: ImageAssetInfo) => {
            const isCopiedUrl = copiedId === `${asset.id}-url`;
            const isCopiedHtml = copiedId === `${asset.id}-html`;

            return (
              <div
                key={asset.id}
                className="bg-[#f8f9ff] border border-[#e5eeff] rounded-xl p-3.5 flex flex-col gap-3 transition-all hover:border-[#c1c1ff]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-white border border-[#e5eeff] p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                    <img
                      src={asset.url}
                      alt={asset.title}
                      className="w-full h-full object-cover rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-bold text-[14px] text-[#0b1c30] truncate">
                        {asset.title}
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#e2dfff] text-[#0a006b] rounded-full shrink-0">
                        {asset.category}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#464555] line-clamp-1 mt-0.5">
                      {asset.description}
                    </p>
                  </div>
                </div>

                {/* Direct URL Box */}
                <div className="bg-white rounded-lg p-2.5 border border-[#e5eeff] flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold text-[#777587]">
                      Link Direto Oficial
                    </span>
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-[11px] text-[#3a34d3] font-semibold hover:underline flex items-center gap-0.5"
                    >
                      Abrir link
                      <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                    </a>
                  </div>
                  <div className="font-mono text-[11px] text-[#0b1c30] truncate bg-[#f8f9ff] px-2 py-1.5 rounded border border-[#e5eeff]">
                    {asset.url}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleCopy(asset.url, asset.id, 'url')}
                      className="flex-1 py-1.5 px-3 rounded-md bg-[#3a34d3] hover:bg-[#5452ec] text-white text-[12px] font-bold flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {isCopiedUrl ? 'check' : 'content_copy'}
                      </span>
                      <span>{isCopiedUrl ? 'URL Copiada!' : 'Copiar URL'}</span>
                    </button>
                    <button
                      onClick={() => handleCopy(asset.htmlSnippet, asset.id, 'html')}
                      className="flex-1 py-1.5 px-3 rounded-md bg-[#eff4ff] hover:bg-[#dce9ff] text-[#3a34d3] text-[12px] font-bold flex items-center justify-center gap-1.5 transition-transform active:scale-95 border border-[#c1c1ff]"
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {isCopiedHtml ? 'check' : 'code'}
                      </span>
                      <span>{isCopiedHtml ? 'Tag Copiada!' : 'Copiar Tag <img>'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e5eeff] bg-[#f8f9ff] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-[#3a34d3] text-white text-[13px] font-bold hover:bg-[#5452ec] transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
