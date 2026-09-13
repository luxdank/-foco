import React, { useState } from 'react';
import { APP_IMAGES, CLASS_FEED } from '../data/mockData';

export const TurmaScreen: React.FC = () => {
  const [cheered, setCheered] = useState<boolean>(false);
  const [newPostText, setNewPostText] = useState<string>('');
  const [posts, setPosts] = useState(CLASS_FEED);

  const handleSendCheer = () => {
    setCheered(true);
    setTimeout(() => setCheered(false), 3000);
  };

  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    const newPost = {
      id: `post-${Date.now()}`,
      author: 'Lucas Andrade (Você)',
      avatar: APP_IMAGES.userProfile,
      role: 'Estudante • 3º Ano A',
      time: 'Agora mesmo',
      content: newPostText.trim(),
      badge: 'Mensagem da Turma'
    };
    setPosts([newPost, ...posts]);
    setNewPostText('');
  };

  return (
    <div className="flex flex-col w-full gap-5 pb-8">
      {/* Header da Turma */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-[#3a34d3] text-[26px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              groups
            </span>
            <h1 className="text-[26px] font-bold text-[#0b1c30] tracking-tight">
              Turma 3º Ano A
            </h1>
          </div>
          <span className="text-[11px] font-bold text-[#3a34d3] bg-[#e2dfff] px-3 py-1 rounded-full">
            32 estudantes
          </span>
        </div>
        <p className="text-[13px] text-[#464555]">
          Espaço colaborativo da classe, avisos de professores e metas conjuntas.
        </p>
      </div>

      {/* Colegas em Foco Agora */}
      <div className="bg-white rounded-[1.9rem] p-4 border-2 border-[#e2dfff] shadow-[inset_0_3px_0_rgba(255,255,255,0.95),0_14px_34px_-18px_rgba(38,26,150,0.35)] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-bold text-[#0b1c30] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#005d3e] animate-ping"></span>
            28 Colegas Focados Agora
          </span>
          <button
            onClick={handleSendCheer}
            className={`text-[12px] font-bold px-3 py-1 rounded-full transition-all active:scale-95 flex items-center gap-1 ${
              cheered
                ? 'bg-[#6ffbbe] text-[#005236]'
                : 'bg-[#eff4ff] text-[#3a34d3] hover:bg-[#dce9ff]'
            }`}
          >
            <span>{cheered ? 'Palmas Enviadas! 👏' : 'Enviar Ânimo 👏'}</span>
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="relative">
              <img
                src={APP_IMAGES.userProfile}
                alt="Você"
                className="w-12 h-12 rounded-full ring-2 ring-[#3a34d3] object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#005d3e] rounded-full ring-2 ring-white"></span>
            </div>
            <span className="text-[11px] font-bold text-[#3a34d3]">Você</span>
          </div>

          {APP_IMAGES.peers.map((url, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1 shrink-0">
              <div className="relative">
                <img
                  src={url}
                  alt={`Colega ${idx + 1}`}
                  className="w-12 h-12 rounded-full ring-2 ring-[#dce9ff] object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#005d3e] rounded-full ring-2 ring-white"></span>
              </div>
              <span className="text-[11px] text-[#464555]">
                {idx === 0 ? 'Mariana' : idx === 1 ? 'Guilherme' : 'Clara'}
              </span>
            </div>
          ))}

          <div className="w-12 h-12 rounded-full bg-[#eff4ff] border border-dashed border-[#c1c1ff] flex items-center justify-center text-[12px] font-bold text-[#3a34d3] shrink-0">
            +24
          </div>
        </div>
      </div>

      {/* Caixa de Mensagem Rápida */}
      <form
        onSubmit={handleAddPost}
        className="bg-white rounded-[1.9rem] p-3 border-2 border-[#e2dfff] shadow-[inset_0_3px_0_rgba(255,255,255,0.95),0_12px_28px_-16px_rgba(38,26,150,0.3)] flex items-center gap-2"
      >
        <img
          src={APP_IMAGES.userProfile}
          alt="Você"
          className="w-8 h-8 rounded-full object-cover shrink-0"
          referrerPolicy="no-referrer"
        />
        <input
          type="text"
          value={newPostText}
          onChange={(e) => setNewPostText(e.target.value)}
          placeholder="Compartilhe uma dica ou dúvida com a turma..."
          className="flex-1 text-[13px] bg-[#f8f9ff] px-3 py-2 rounded-xl border border-[#e5eeff] focus:outline-none focus:border-[#3a34d3]"
        />
        <button
          type="submit"
          disabled={!newPostText.trim()}
          className="p-2 bg-[#3a34d3] hover:bg-[#5452ec] disabled:opacity-40 text-white rounded-xl active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">send</span>
        </button>
      </form>

      {/* Mural da Turma */}
      <div className="space-y-3">
        <h3 className="text-[16px] font-bold text-[#0b1c30]">Mural de Avisos &amp; Feed</h3>

        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-[1.9rem] p-4 border-2 border-[#e2dfff] shadow-[inset_0_3px_0_rgba(255,255,255,0.95),0_14px_34px_-18px_rgba(38,26,150,0.35)] space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={post.avatar}
                  alt={post.author}
                  className="w-9 h-9 rounded-full object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-[13px] font-bold text-[#0b1c30]">{post.author}</h4>
                  <p className="text-[11px] text-[#777587]">
                    {post.role} • {post.time}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#eff4ff] text-[#3a34d3] rounded-full">
                {post.badge}
              </span>
            </div>

            <p className="text-[13px] text-[#464555] leading-relaxed">{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
