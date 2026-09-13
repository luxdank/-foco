import React, { useState, useRef, useEffect } from 'react';
import {
  UserProfile,
  VirtualRoomInfo,
  VirtualRoomParticipant,
  RoomPoll,
  RoomMaterial,
  RoomLink
} from '../types';
import { INITIAL_ROOM_PARTICIPANTS } from '../data/mockData';
import { useRoomChat } from '../lib/useRoomChat';
import { useRoomPolls, useRoomMaterials, useRoomLinks } from '../lib/roomData';
import { useRoomAttention, formatDuration } from '../lib/attentionStore';
import LogoImage from '../components/LogoImage';

type RoomTab = 'chat' | 'enquete' | 'materiais' | 'links' | 'participantes';

interface SalaVirtualScreenProps {
  virtualRoom: VirtualRoomInfo;
  currentUser: UserProfile;
  onLeaveRoom: () => void;
  onSendDoubtToTeacher?: (topic: string, question: string) => void;
  onEndRoomAsTeacher?: () => void;
}

const materialIcon = (type: string) =>
  type === 'pdf' ? 'picture_as_pdf' : type === 'slides' ? 'slideshow' : type === 'image' ? 'image' : 'link';

const materialBg = (type: string) =>
  type === 'pdf'
    ? 'bg-[#ffdad3]/15 text-[#ffb77c]'
    : type === 'slides'
    ? 'bg-[#e2dfff]/15 text-[#b6c0ff]'
    : type === 'image'
    ? 'bg-[#e2dfff]/15 text-[#b6c0ff]'
    : 'bg-[#6ffbbe]/15 text-[#6ffbbe]';

export const SalaVirtualScreen: React.FC<SalaVirtualScreenProps> = ({
  virtualRoom,
  currentUser,
  onLeaveRoom,
  onSendDoubtToTeacher,
  onEndRoomAsTeacher
}) => {
  const isTeacher = currentUser.role === 'professor';

  // Room participants (current user entry injected dynamically)
  const [participants, setParticipants] = useState<VirtualRoomParticipant[]>(() => {
    const base = INITIAL_ROOM_PARTICIPANTS.filter((p) => p.id !== 'student-lucas');
    return [
      {
        id: currentUser.id,
        name: `${currentUser.name} (Você)`,
        avatar: currentUser.avatar,
        role: currentUser.role,
        desk: isTeacher ? 'Mesa do Professor' : 'Mesa 04',
        isMuted: isTeacher ? false : true,
        isVideoOn: true,
        handRaised: false
      },
      ...base
    ];
  });

  // Live chat state (Firestore with local fallback)
  const chatKey = virtualRoom.accessCode;
  const { messages, send: sendChatMessage, sendSystemNotice, status: chatStatus } = useRoomChat(
    chatKey,
    currentUser,
    onSendDoubtToTeacher
  );
  // Mensagens discretas só aparecem para o próprio autor e para o professor (docente)
  const visibleMessages = messages.filter(
    (m) =>
      !m.isPrivateToTeacher ||
      currentUser.role === 'professor' ||
      (m.senderUserId && m.senderUserId === currentUser.id)
  );
  const [newMessageText, setNewMessageText] = useState<string>('');
  const [isPrivateDoubt, setIsPrivateDoubt] = useState<boolean>(false);

  // A requisição do código se comunica com a sala: ao entrar, anuncia no chat ao vivo.
  const joinAnnouncedRef = useRef<boolean>(false);
  useEffect(() => {
    if (isTeacher || joinAnnouncedRef.current) return;
    joinAnnouncedRef.current = true;
    sendSystemNotice(
      `${currentUser.name} entrou na sala usando o código ${virtualRoom.accessCode}.`
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // In-room controls
  const [hasHandRaised, setHasHandRaised] = useState<boolean>(false);
  const [floatingReactions, setFloatingReactions] = useState<{ id: number; emoji: string; x: number }[]>([]);

  // Tabs, Polls, Materiais & Links (all synced wie Firestore com fallback local)
  const [activeTab, setActiveTab] = useState<RoomTab>('chat');

  const votesStorageKey = `foco-votes-${chatKey}`;
  const [userVotes, setUserVotesState] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem(votesStorageKey) || '{}');
    } catch {
      return {};
    }
  });
  const markVote = (pollId: string, optionId: string) => {
    setUserVotesState((prev) => {
      const next = { ...prev, [pollId]: optionId };
      localStorage.setItem(votesStorageKey, JSON.stringify(next));
      return next;
    });
  };

  const { polls, syncStatus: pollsStatus, launchPoll, votePoll, togglePollStatus } = useRoomPolls(chatKey);
  const { materials, syncStatus: materialsStatus, addMaterial } = useRoomMaterials(chatKey);
  const { links, syncStatus: linksStatus, addLink } = useRoomLinks(chatKey);

  // Atenção do aluno dentro da sala: detecta troca de aba / minimizar / trocar de
  // janela e registra o tempo "fora da aula" (visível ao professor na aba Turma).
  const attention = useRoomAttention(chatKey, currentUser);

  // Enquete creation form (teacher)
  const [showCreatePoll, setShowCreatePoll] = useState<boolean>(false);
  const [pollQuestion, setPollQuestion] = useState<string>('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [pollNotice, setPollNotice] = useState<string | null>(null);

  // Material creation form (teacher)
  const [showAddMaterial, setShowAddMaterial] = useState<boolean>(false);
  const [matTitle, setMatTitle] = useState<string>('');
  const [matUrl, setMatUrl] = useState<string>('');
  const [matType, setMatType] = useState<RoomMaterial['type']>('pdf');
  const [matSize, setMatSize] = useState<string>('');

  // Link creation form (teacher)
  const [showAddLink, setShowAddLink] = useState<boolean>(false);
  const [linkTitle, setLinkTitle] = useState<string>('');
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [linkTag, setLinkTag] = useState<string>('');

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  // Floating quick reactions
  const triggerFloatingReaction = (emoji: string) => {
    const id = Date.now() + Math.random();
    const x = Math.floor(Math.random() * 60) + 20;
    setFloatingReactions((prev) => [...prev, { id, emoji, x }]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2200);
  };

  // Alerta visual para o aluno quando ele volta de uma ausência (troca de aba/minimizar)
  const [awayAlert, setAwayAlert] = useState<{ text: string; id: number } | null>(null);
  useEffect(() => {
    const last = attention.myLastAway;
    if (!last || isTeacher) return;
    setAwayAlert({
      text: `Você esteve fora por ${formatDuration(last.durationMs)} — foco na aula!`,
      id: last.durationMs + Date.now()
    });
    triggerFloatingReaction('👀');
    const t = setTimeout(() => setAwayAlert(null), 8000);
    return () => {
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attention.myLastAway]);

  // Handle hand raising by student
  const handleToggleHand = () => {
    const nextState = !hasHandRaised;
    setHasHandRaised(nextState);

    setParticipants((prev) =>
      prev.map((p) => (p.id === currentUser.id ? { ...p, handRaised: nextState } : p))
    );

    if (nextState) {
      triggerFloatingReaction('✋');
      // Sistema avisa a turma no chat
      sendSystemNotice(`${currentUser.name} levantou a mão para tirar uma dúvida!`);
    }
  };

  // Send message in chat (real-time via Firestore with local fallback)
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    sendChatMessage(newMessageText, isPrivateDoubt);
    setNewMessageText('');
    setIsPrivateDoubt(false);
  };

  // Copy room access code (replaces the old native-link copy)
  const handleCopyCode = () => {
    navigator.clipboard.writeText(virtualRoom.accessCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Polls (synced in real time)
  const handleVote = (pollId: string, optionId: string) => {
    if (userVotes[pollId]) return;
    markVote(pollId, optionId);
    votePoll(pollId, optionId);
    triggerFloatingReaction('✅');
  };

  const handleLaunchPoll = (e: React.FormEvent) => {
    e.preventDefault();
    const question = pollQuestion.trim();
    const options = pollOptions.map((o) => o.trim()).filter(Boolean);
    if (!question || options.length < 2) return;

    launchPoll(question, options, currentUser.name);
    setShowCreatePoll(false);
    setPollQuestion('');
    setPollOptions(['', '']);
    setPollNotice(`Enquete lançada para a turma: "${question}"`);
    window.setTimeout(() => setPollNotice(null), 4500);
  };

  // Materials (synced in real time)
  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    const title = matTitle.trim();
    const url = matUrl.trim();
    if (!title || !url) return;

    addMaterial({
      id: `mat-${Date.now()}`,
      title,
      url,
      type: matType,
      fileSize: matSize.trim() || undefined,
      description: undefined
    });
    setShowAddMaterial(false);
    setMatTitle('');
    setMatUrl('');
    setMatSize('');
  };

  // Links (synced in real time)
  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    const title = linkTitle.trim();
    const url = linkUrl.trim();
    if (!title || !url) return;

    addLink({
      id: `link-${Date.now()}`,
      title,
      url,
      icon: 'link',
      tag: linkTag.trim() || undefined
    });
    setShowAddLink(false);
    setLinkTitle('');
    setLinkUrl('');
    setLinkTag('');
  };

  const sortedPolls = [...polls].sort((a, b) => Number(b.isOpen) - Number(a.isOpen));
  const handRaisedStudents = participants.filter((p) => p.handRaised && p.role === 'aluno');

  const syncBadge = (status: 'conectando' | 'online' | 'local') => ({
    conectando: { label: 'Conectando', className: 'bg-white/10 text-[#c7c4d8]' },
    online: { label: 'Online', className: 'bg-[#6ffbbe]/20 text-[#6ffbbe]' },
    local: { label: 'Modo local', className: 'bg-[#ffb77c]/20 text-[#ffb77c]' }
  }[status]);

  const chatStatusBadge = syncBadge(chatStatus);
  const pollsStatusBadge = syncBadge(pollsStatus);
  const materialsStatusBadge = syncBadge(materialsStatus);
  const linksStatusBadge = syncBadge(linksStatus);

  const tabs: { id: RoomTab; label: string; icon: string; badge?: string }[] = [
    { id: 'chat', label: 'Chat', icon: 'forum', badge: String(visibleMessages.length) },
    { id: 'enquete', label: 'Enquete', icon: 'poll' },
    { id: 'materiais', label: 'Materiais', icon: 'folder_open' },
    { id: 'links', label: 'Links', icon: 'link' },
    {
      id: 'participantes',
      label: 'Turma',
      icon: 'group',
      badge: String(participants.length)
    }
  ];

  // Sala fechada ou encerrada pelo professor: alunos ficam de fora / são liberados.
  // Alunos NÃO conseguem sair enquanto a sala estiver ativa (somente o professor encerra ou autoriza).
  if (!virtualRoom.isActive) {
    return (
      <div className="fixed inset-0 z-50 bg-[#070e17] text-white flex flex-col items-center justify-center gap-5 px-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-[#3a34d3]/30 text-[#b6c0ff] flex items-center justify-center border border-[#3a34d3]/40">
          <span className="material-symbols-outlined text-[32px]">meeting_room</span>
        </div>
        <div>
          <h2 className="text-[18px] font-extrabold text-white">
            {isTeacher ? 'Sala virtual fechada' : 'A sala virtual está fechada'}
          </h2>
          <p className="text-[12px] text-[#c7c4d8] mt-1.5 leading-relaxed">
            {isTeacher
              ? 'Abra a sala para os alunos entrarem na aula.'
              : 'Aguarde o professor abrir a sala para entrar. Você não pode entrar em uma sala fechada.'}
          </p>
        </div>
        <button
          onClick={onLeaveRoom}
          className="px-5 py-2.5 rounded-xl bg-[#3a34d3] hover:bg-[#5452ec] text-white font-bold text-[13px] flex items-center gap-1.5 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[17px]">
            {isTeacher ? 'dashboard' : 'logout'}
          </span>
          {isTeacher ? 'Voltar ao painel' : 'Sair'}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#070e17] text-white flex flex-col font-sans select-none overflow-hidden animate-in fade-in duration-200">
      {/* 1. TOP BAR: Mobile-optimized Room Header */}
      <header className="h-14 sm:h-16 px-3 sm:px-4 bg-[#0d1624]/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between gap-2 shrink-0 z-30">
        {/* Left: Back/Leave button & Room Status */}
        <div className="flex items-center gap-2 min-w-0">
          {isTeacher ? (
            <button
              onClick={onLeaveRoom}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white transition-all shrink-0"
              title="Sair da Sala Virtual"
              aria-label="Sair da Sala"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
          ) : (
            <div
              className="w-9 h-9 rounded-xl bg-[#3a34d3]/30 flex items-center justify-center text-[#b6c0ff] border border-[#3a34d3]/40 shrink-0"
              title="Você não pode sair da aula até o professor encerrar a sala"
            >
              <span className="material-symbols-outlined text-[20px]">lock</span>
            </div>
          )}

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <LogoImage variant="light" alt="+Foco" className="h-4 w-auto object-contain shrink-0" />
              <span className="w-2 h-2 rounded-full bg-[#6ffbbe] animate-pulse shrink-0"></span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6ffbbe] truncate">
                SALA NATIVA +Foco • AO VIVO
              </span>
            </div>
            <h1 className="text-[13px] sm:text-[15px] font-bold text-white truncate leading-tight">
              {virtualRoom.roomName}
            </h1>
          </div>
        </div>

        {/* Center/Right: Role Badge & Quick Switcher + Share Code */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Native Room Code Pill */}
          <button
            onClick={handleCopyCode}
            className="hidden xs:flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[11px] font-mono text-[#c7c4d8] border border-white/10 active:scale-95 transition-all"
            title="Clique para copiar o código da sala"
          >
            <span className="material-symbols-outlined text-[13px] text-[#6ffbbe]">
              {copiedCode ? 'check' : 'key'}
            </span>
            <span className="truncate">{virtualRoom.accessCode}</span>
          </button>

          {/* Close Room Button (teacher only — closes the room and returns) */}
          {isTeacher && (
            <button
              onClick={() => {
                if (onEndRoomAsTeacher) onEndRoomAsTeacher();
                onLeaveRoom();
              }}
              className="px-3 py-1 rounded-xl bg-[#b22200] hover:bg-[#8f1b00] text-white text-[12px] font-bold flex items-center gap-1 active:scale-95 transition-all shadow-sm shrink-0"
              title="Fechar a sala para toda a turma (novo código será gerado)"
            >
              <span className="material-symbols-outlined text-[16px]">stop_circle</span>
              <span className="hidden sm:inline">Fechar Sala</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. ROOM TABS (Chat / Enquete / Materiais / Links / Turma) */}
      <nav className="grid grid-cols-5 gap-1 shrink-0 bg-[#0b131e] px-2 py-1.5 border-b border-white/10 text-[12px] font-bold z-20">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
                isActive
                  ? 'bg-[#3a34d3] text-white shadow'
                  : 'text-[#c7c4d8] hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              <span className="leading-none">{tab.label}</span>
              {tab.badge && (
                <span
                  className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${
                    isActive
                      ? 'bg-[#6ffbbe] text-[#002113]'
                      : 'bg-white/10 text-[#c7c4d8]'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Locked-in notice for students while class is live */}
      {!isTeacher && (
        <div className="shrink-0 bg-[#3a34d3]/20 border-b border-[#3a34d3]/30 text-[#b6c0ff] px-3 py-1.5 text-[10px] font-extrabold flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[13px]">lock</span>
          Presença obrigatória: você não pode sair desta aula até o professor encerrar a sala.
        </div>
      )}

      {/* Live attention banner for the professor */}
      {isTeacher && attention.awayCount > 0 && (
        <div className="shrink-0 bg-[#b22200]/20 border-b border-[#b22200]/40 text-[#ffb77c] px-3 py-1.5 text-[10px] font-extrabold flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[13px] animate-pulse">visibility</span>
          {attention.awayCount} aluno(s) fora da aula agora — confira os detalhes na aba Turma.
        </div>
      )}

      {/* 3. MAIN WORKSPACE */}
      <main className="flex-1 overflow-hidden relative">
        {/* Floating animated reactions layer */}
        <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
          {floatingReactions.map((r) => (
            <div
              key={r.id}
              className="absolute text-[32px] sm:text-[40px] animate-bounce"
              style={{
                left: `${r.x}%`,
                bottom: '120px',
                animation: 'fadeAndRise 2s ease-out forwards'
              }}
            >
              {r.emoji}
            </div>
          ))}
        </div>

        {/* Poll launched notice */}
        {pollNotice && (
          <div className="absolute top-3 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-40 bg-[#005d3e] text-white p-3.5 rounded-2xl shadow-2xl border border-[#6ffbbe] flex items-start gap-2.5 animate-in slide-in-from-top-4 duration-300">
            <span className="material-symbols-outlined text-[20px] text-[#6ffbbe] shrink-0">poll</span>
            <div className="flex-1 min-w-0">
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6ffbbe]">
                Enquete Relâmpago
              </span>
              <p className="text-[12px] font-semibold">{pollNotice}</p>
            </div>
            <button onClick={() => setPollNotice(null)} className="text-white/60 hover:text-white shrink-0">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* Away-from-focus alert (student returning to the class) */}
        {awayAlert && !isTeacher && (
          <div className="absolute top-3 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-40 bg-[#b22200] text-white p-3.5 rounded-2xl shadow-2xl border border-[#ff5a4e] flex items-start gap-2.5 animate-in slide-in-from-top-4 duration-300">
            <span className="material-symbols-outlined text-[20px] text-[#ffb77c] shrink-0">visibility_off</span>
            <div className="flex-1 min-w-0">
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-[#ffb77c]">
                Foco na aula
              </span>
              <p className="text-[12px] font-semibold">{awayAlert.text}</p>
            </div>
            <button
              onClick={() => setAwayAlert(null)}
              className="text-white/60 hover:text-white shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* CHAT TAB */}
        {activeTab === 'chat' && (
          <section className="h-full flex flex-col">
            {/* Live header */}
            <div className="px-4 pt-3 pb-2.5 border-b border-white/10 bg-[#0d1624]/70 shrink-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6ffbbe] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#6ffbbe]"></span>
                  </span>
                  <span className="text-[12px] font-extrabold uppercase tracking-wider text-[#6ffbbe]">
                    Chat ao vivo
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${chatStatusBadge.className}`}
                  >
                    <span className="w-1 h-1 rounded-full bg-current animate-pulse"></span>
                    {chatStatusBadge.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-[#c7c4d8]">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">group</span>
                    {participants.length} na sala
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">forum</span>
                    {messages.length}
                  </span>
                </div>
              </div>

              {virtualRoom.topicDescription && (
                <p className="text-[12px] text-[#e5eeff] mt-1.5 leading-snug">
                  📋 {virtualRoom.topicDescription}
                </p>
              )}

              {isTeacher && (
                <button
                  onClick={() => {
                    setActiveTab('enquete');
                    setShowCreatePoll(true);
                  }}
                  className="mt-2.5 w-full py-2 rounded-xl bg-[#005d3e] hover:bg-[#007852] text-white text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-[16px]">poll</span>
                  Lançar enquete para a turma
                </button>
              )}
            </div>

            {/* Quick reactions */}
            <div className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto no-scrollbar bg-[#0b131e] border-b border-white/5 shrink-0">
              <button
                onClick={() => triggerFloatingReaction('👍')}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-[12px] font-bold flex items-center gap-1.5 transition-all shrink-0"
                title="Entendi o conteúdo"
              >
                <span>👍</span>
                <span className="hidden xs:inline">Entendi</span>
              </button>
              <button
                onClick={() => triggerFloatingReaction('✋')}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-[12px] font-bold flex items-center gap-1.5 transition-all shrink-0"
                title="Pode repetir por favor?"
              >
                <span>✋</span>
                <span className="hidden xs:inline">Repetir</span>
              </button>
              <button
                onClick={() => triggerFloatingReaction('❓')}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-[12px] font-bold flex items-center gap-1.5 transition-all shrink-0"
                title="Tenho uma dúvida"
              >
                <span>❓</span>
                <span className="hidden xs:inline">Dúvida</span>
              </button>
              <button
                onClick={() => triggerFloatingReaction('💡')}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-[12px] font-bold flex items-center gap-1.5 transition-all shrink-0"
                title="Excelente ideia"
              >
                <span>💡</span>
                <span className="hidden xs:inline">Saquei</span>
              </button>
            </div>

            {/* Messages list */}
            <div className="flex-1 p-3 space-y-3 overflow-y-auto">
              <div className="text-center py-2">
                <span className="text-[10px] text-[#c7c4d8]/70 bg-white/5 px-2.5 py-1 rounded-full">
                  Chat nativo criptografado da turma
                </span>
              </div>

              {visibleMessages.map((m) => {
                const isMe =
                  m.senderUserId === currentUser.id || m.senderName.includes(currentUser.name);
                const isProf = m.senderRole === 'professor';

                return (
                  <div
                    key={m.id}
                    className={`flex flex-col gap-0.5 ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1 text-[10px] text-[#c7c4d8] px-1">
                      <span className="font-bold text-white">{m.senderName}</span>
                      {isProf && (
                        <span className="bg-[#3a34d3] text-white px-1.5 py-0.2 rounded text-[8px] font-extrabold">
                          DOCENTE
                        </span>
                      )}
                      <span>• {m.time}</span>
                    </div>

                    <div
                      className={`p-2.5 rounded-2xl max-w-[88%] text-[12px] leading-relaxed break-words ${
                        m.isPrivateToTeacher
                          ? 'bg-[#ffdad3]/20 border border-[#ffdad3]/40 text-[#ffdad3]'
                          : isMe
                          ? 'bg-[#3a34d3] text-white rounded-br-none'
                          : isProf
                          ? 'bg-[#005d3e]/30 border border-[#6ffbbe]/40 text-[#e5eeff] rounded-bl-none'
                          : 'bg-white/10 text-[#e5eeff] rounded-bl-none'
                      }`}
                    >
                      {m.isPrivateToTeacher && (
                        <span className="block text-[10px] font-extrabold uppercase text-[#ffb77c] mb-0.5">
                          🔒 Dúvida Discreta ao Professor
                        </span>
                      )}
                      {m.text}
                    </div>
                  </div>
                );
              })}

              {chatStatus === 'local' && (
                <div className="bg-[#ffb77c]/10 border border-[#ffb77c]/30 text-[#ffb77c] rounded-xl px-3 py-2 text-[11px] flex items-start gap-2">
                  <span className="material-symbols-outlined text-[15px] shrink-0">cloud_off</span>
                  <span className="font-semibold">
                    Sem conexão com o Firebase: o chat está em <b>modo local</b> (aba atual + abas do mesmo
                    navegador). Habilite o Firestore para sincronizar entre dispositivos.
                  </span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Chat input form */}
            <form
              onSubmit={handleSendMessage}
              className="p-2.5 border-t border-white/10 bg-[#0d1624] flex flex-col gap-2 shrink-0"
            >
              {!isTeacher && (
                <label className="flex items-center gap-1.5 text-[11px] text-[#c7c4d8] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPrivateDoubt}
                    onChange={(e) => setIsPrivateDoubt(e.target.checked)}
                    className="rounded accent-[#3a34d3] w-3.5 h-3.5"
                  />
                  <span>Enviar como dúvida discreta só para o professor</span>
                </label>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder={
                    isPrivateDoubt
                      ? 'Escreva sua dúvida reservada...'
                      : 'Enviar mensagem para a sala...'
                  }
                  className="flex-1 bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-[12px] text-white placeholder:text-white/40 focus:outline-none focus:border-[#3a34d3]"
                />
                <button
                  type="submit"
                  className="w-9 h-9 rounded-xl bg-[#3a34d3] hover:bg-[#5452ec] active:scale-95 flex items-center justify-center text-white transition-all shrink-0"
                  title="Enviar"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ENQUETE TAB */}
        {activeTab === 'enquete' && (
          <section className="h-full overflow-y-auto p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-[#005d3e]/30 text-[#6ffbbe] flex items-center justify-center shrink-0 border border-[#6ffbbe]/30">
                  <span className="material-symbols-outlined text-[22px]">poll</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[15px] font-extrabold text-white truncate">Enquetes ao vivo</h2>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${pollsStatusBadge.className}`}
                      title={
                        pollsStatus === 'local'
                          ? 'Sem Firebase — sincronizando apenas neste navegador'
                          : 'Sincronizado em tempo real'
                      }
                    >
                      <span className="w-1 h-1 rounded-full bg-current animate-pulse"></span>
                      {pollsStatusBadge.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#c7c4d8]">Respostas computadas em tempo real</p>
                </div>
              </div>
              {isTeacher && (
                <button
                  onClick={() => setShowCreatePoll(!showCreatePoll)}
                  className={`px-3 py-2 rounded-xl text-[12px] font-bold flex items-center gap-1.5 transition-all active:scale-95 shrink-0 ${
                    showCreatePoll
                      ? 'bg-white/10 text-white'
                      : 'bg-[#3a34d3] text-white hover:bg-[#5452ec]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {showCreatePoll ? 'close' : 'add_circle'}
                  </span>
                  <span>{showCreatePoll ? 'Fechar' : 'Nova'}</span>
                </button>
              )}
            </div>

            {/* Create poll form (teacher only) */}
            {isTeacher && showCreatePoll && (
              <form
                onSubmit={handleLaunchPoll}
                className="bg-[#131d2b] border border-[#3a34d3]/50 rounded-2xl p-4 space-y-3"
              >
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#3a34d3] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px]">edit_note</span>
                  Nova enquete
                </span>

                <input
                  type="text"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="Digite a pergunta da enquete..."
                  className="w-full text-[13px] px-3.5 py-2.5 bg-[#0b131e] border border-white/15 rounded-xl focus:outline-none focus:border-[#3a34d3] placeholder:text-white/30 text-white"
                />

                <div className="space-y-2">
                  {pollOptions.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#3a34d3]/30 text-[#b6c0ff] text-[11px] font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <input
                        type="text"
                        value={pollOptions[i]}
                        onChange={(e) =>
                          setPollOptions((prev) =>
                            prev.map((p, idx) => (idx === i ? e.target.value : p))
                          )
                        }
                        placeholder={`Opção ${i + 1}`}
                        className="flex-1 text-[13px] px-3 py-2 bg-[#0b131e] border border-white/15 rounded-xl focus:outline-none focus:border-[#3a34d3] placeholder:text-white/30 text-white"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() =>
                            setPollOptions((prev) => prev.filter((_, idx) => idx !== i))
                          }
                          className="w-8 h-8 rounded-lg bg-[#ffdad3]/15 text-[#ffb77c] flex items-center justify-center hover:bg-[#ffdad3]/25 transition-all shrink-0"
                          title="Remover opção"
                        >
                          <span className="material-symbols-outlined text-[16px]">remove</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {pollOptions.length < 4 && (
                  <button
                    type="button"
                    onClick={() => setPollOptions([...pollOptions, ''])}
                    className="w-full py-2 rounded-xl border border-dashed border-[#3a34d3]/50 text-[#b6c0ff] text-[12px] font-bold hover:bg-[#3a34d3]/10 transition-all"
                  >
                    + Adicionar opção ({pollOptions.length}/4)
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#005d3e] hover:bg-[#007852] text-white font-bold text-[12px] flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
                    Lançar enquete
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreatePoll(false);
                      setPollQuestion('');
                      setPollOptions(['', '']);
                    }}
                    className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[12px] transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {/* Poll list */}
            {sortedPolls.map((poll) => {
              const totalVotes = poll.options.reduce((acc, o) => acc + o.votes, 0);
              const votedOptionId = userVotes[poll.id];
              const canVote = poll.isOpen && !votedOptionId;

              return (
                <div
                  key={poll.id}
                  className="bg-[#131d2b] border border-white/10 rounded-2xl p-4 space-y-3"
                >
                  {/* Poll header */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                        poll.isOpen
                          ? 'bg-[#6ffbbe]/20 text-[#6ffbbe]'
                          : 'bg-white/10 text-[#c7c4d8]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          poll.isOpen ? 'bg-[#6ffbbe] animate-pulse' : 'bg-[#c7c4d8]'
                        }`}
                      ></span>
                      {poll.isOpen ? 'Enquete aberta' : 'Enquete concluída'}
                    </span>
                    <span className="text-[10px] text-[#c7c4d8]">
                      {totalVotes} {totalVotes === 1 ? 'voto' : 'votos'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-[14px] font-extrabold text-white leading-snug">
                      {poll.question}
                    </h3>
                    <p className="text-[10px] text-[#c7c4d8] mt-0.5">
                      {poll.createdBy} • {poll.createdAt}
                    </p>
                  </div>

                  {/* Options */}
                  <div className="space-y-2">
                    {poll.options.map((opt) => {
                      const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                      const isUserPick = votedOptionId === opt.id;
                      const showResult = !!votedOptionId || !poll.isOpen;

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          disabled={!canVote}
                          onClick={() => handleVote(poll.id, opt.id)}
                          className={`relative w-full text-left overflow-hidden rounded-xl border p-3 transition-all ${
                            canVote
                              ? 'border-white/15 bg-white/5 hover:border-[#6ffbbe]/50 hover:bg-white/10 active:scale-[0.98]'
                              : isUserPick
                              ? 'border-[#6ffbbe] bg-[#6ffbbe]/15'
                              : 'border-white/10 bg-white/[0.03]'
                          }`}
                        >
                          {/* Result bar */}
                          {showResult && (
                            <div
                              className="absolute inset-y-0 left-0 bg-[#3a34d3]/40 opacity-60 transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            ></div>
                          )}

                          <div className="relative flex items-center justify-between gap-2 z-10">
                            <span className="flex items-center gap-2 text-[13px] font-semibold text-white min-w-0">
                              <span>{opt.label}</span>
                              {isUserPick && (
                                <span className="text-[#6ffbbe]">
                                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                </span>
                              )}
                            </span>
                            {!canVote && (
                              <span className="flex items-center gap-2 shrink-0">
                                <span className="text-[12px] font-bold text-white">{pct}%</span>
                                <span className="text-[10px] text-[#c7c4d8]">
                                  {opt.votes} {opt.votes === 1 ? 'voto' : 'votos'}
                                </span>
                              </span>
                            )}
                          </div>

                          {canVote && (
                            <span className="relative z-10 block text-[9px] text-[#6ffbbe]/80 mt-0.5">
                              Toque para votar
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Confirmation / teacher actions */}
                  {votedOptionId && (
                    <p className="text-[11px] font-bold text-[#6ffbbe] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">how_to_vote</span>
                      Voto registrado! A resposta da turma está sendo exibida ao vivo.
                    </p>
                  )}

                  {isTeacher && (
                    <button
                      onClick={() => togglePollStatus(poll.id)}
                      className={`w-full py-2 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${
                        poll.isOpen
                          ? 'bg-[#ffdad3]/15 text-[#ffb77c] hover:bg-[#ffdad3]/25'
                          : 'bg-[#6ffbbe]/15 text-[#6ffbbe] hover:bg-[#6ffbbe]/25'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {poll.isOpen ? 'toggle_off' : 'toggle_on'}
                      </span>
                      {poll.isOpen ? 'Encerrar enquete' : 'Reabrir enquete'}
                    </button>
                  )}
                </div>
              );
            })}

            {polls.length === 0 && (
              <div className="text-center py-10 text-[12px] text-[#c7c4d8]">
                Nenhuma enquete lançada ainda.
              </div>
            )}
          </section>
        )}

        {/* MATERIAIS TAB */}
        {activeTab === 'materiais' && (
          <section className="h-full overflow-y-auto p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-[#3a34d3]/30 text-[#b6c0ff] flex items-center justify-center shrink-0 border border-[#3a34d3]/40">
                  <span className="material-symbols-outlined text-[22px]">folder_open</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[15px] font-extrabold text-white truncate">Materiais da sala</h2>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${materialsStatusBadge.className}`}
                      title={
                        materialsStatus === 'local'
                          ? 'Sem Firebase — sincronizando apenas neste navegador'
                          : 'Sincronizado em tempo real'
                      }
                    >
                      <span className="w-1 h-1 rounded-full bg-current animate-pulse"></span>
                      {materialsStatusBadge.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#c7c4d8]">
                    {materials.length} arquivos disponíveis
                  </p>
                </div>
              </div>
              {isTeacher && (
                <button
                  onClick={() => setShowAddMaterial(!showAddMaterial)}
                  className={`px-3 py-2 rounded-xl text-[12px] font-bold flex items-center gap-1.5 transition-all active:scale-95 shrink-0 ${
                    showAddMaterial
                      ? 'bg-white/10 text-white'
                      : 'bg-[#3a34d3] text-white hover:bg-[#5452ec]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {showAddMaterial ? 'close' : 'add_circle'}
                  </span>
                  <span>{showAddMaterial ? 'Fechar' : 'Adicionar'}</span>
                </button>
              )}
            </div>

            {/* Add material form (teacher only) */}
            {isTeacher && showAddMaterial && (
              <form
                onSubmit={handleAddMaterial}
                className="bg-[#131d2b] border border-[#3a34d3]/50 rounded-2xl p-4 space-y-3"
              >
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#3a34d3] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px]">upload_file</span>
                  Novo material
                </span>

                <input
                  type="text"
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  placeholder="Nome do arquivo (ex: Apostila_Volumes.pdf)"
                  className="w-full text-[13px] px-3.5 py-2.5 bg-[#0b131e] border border-white/15 rounded-xl focus:outline-none focus:border-[#3a34d3] placeholder:text-white/30 text-white"
                />
                <input
                  type="url"
                  value={matUrl}
                  onChange={(e) => setMatUrl(e.target.value)}
                  placeholder="Link do arquivo (https://...)"
                  className="w-full text-[13px] px-3.5 py-2.5 bg-[#0b131e] border border-white/15 rounded-xl focus:outline-none focus:border-[#3a34d3] placeholder:text-white/30 text-white"
                />

                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={matType}
                    onChange={(e) => setMatType(e.target.value as RoomMaterial['type'])}
                    className="text-[13px] px-3 py-2.5 bg-[#0b131e] border border-white/15 rounded-xl focus:outline-none focus:border-[#3a34d3] text-white"
                  >
                    <option value="pdf">PDF</option>
                    <option value="slides">Slides</option>
                    <option value="image">Imagem</option>
                    <option value="link">Link</option>
                  </select>
                  <input
                    type="text"
                    value={matSize}
                    onChange={(e) => setMatSize(e.target.value)}
                    placeholder="Tamanho (ex: 3.4 MB)"
                    className="text-[13px] px-3 py-2.5 bg-[#0b131e] border border-white/15 rounded-xl focus:outline-none focus:border-[#3a34d3] placeholder:text-white/30 text-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#005d3e] hover:bg-[#007852] text-white font-bold text-[12px] flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[16px]">upload</span>
                    Adicionar à sala
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddMaterial(false);
                      setMatTitle('');
                      setMatUrl('');
                      setMatSize('');
                    }}
                    className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[12px] transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {materials.length > 0 ? (
              materials.map((mat) => (
                <div
                  key={mat.id}
                  className="bg-[#131d2b] border border-white/10 rounded-2xl p-3.5 flex items-center gap-3 hover:border-[#3a34d3]/50 transition-colors"
                >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${materialBg(mat.type)}`}
                >
                  <span className="material-symbols-outlined text-[22px]">{materialIcon(mat.type)}</span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-white truncate">{mat.title}</p>
                  {mat.description && (
                    <p className="text-[10px] text-[#c7c4d8] leading-snug line-clamp-2">{mat.description}</p>
                  )}
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#6ffbbe]">
                    {mat.type}
                    {mat.fileSize ? ` • ${mat.fileSize}` : ''}
                  </span>
                </div>

                {mat.type === 'image' ? (
                  <button
                    onClick={() => setPreviewImage(mat.previewUrl || mat.url)}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] flex items-center gap-1 transition-all shrink-0"
                  >
                    <span className="material-symbols-outlined text-[15px]">zoom_in</span>
                    <span className="hidden xs:inline">Ver</span>
                  </button>
                ) : (
                  <a
                    href={mat.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] flex items-center gap-1 transition-all shrink-0"
                  >
                    <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                    <span className="hidden xs:inline">Abrir</span>
                  </a>
                )}
              </div>
              ))
            ) : (
              <div className="text-center py-10 text-[12px] text-[#c7c4d8]">
                Nenhum material adicionado ainda.
              </div>
            )}

            <p className="text-center text-[10px] text-[#c7c4d8]/70 pt-1">
              Materiais adicionados pelo professor ficam disponíveis aqui na sala.
            </p>
          </section>
        )}

        {/* LINKS TAB */}
        {activeTab === 'links' && (
          <section className="h-full overflow-y-auto p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-[#005d3e]/30 text-[#6ffbbe] flex items-center justify-center shrink-0 border border-[#6ffbbe]/30">
                  <span className="material-symbols-outlined text-[22px]">link</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[15px] font-extrabold text-white truncate">Links úteis</h2>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${linksStatusBadge.className}`}
                      title={
                        linksStatus === 'local'
                          ? 'Sem Firebase — sincronizando apenas neste navegador'
                          : 'Sincronizado em tempo real'
                      }
                    >
                      <span className="w-1 h-1 rounded-full bg-current animate-pulse"></span>
                      {linksStatusBadge.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#c7c4d8]">Recursos e referências da aula</p>
                </div>
              </div>
              {isTeacher && (
                <button
                  onClick={() => setShowAddLink(!showAddLink)}
                  className={`px-3 py-2 rounded-xl text-[12px] font-bold flex items-center gap-1.5 transition-all active:scale-95 shrink-0 ${
                    showAddLink
                      ? 'bg-white/10 text-white'
                      : 'bg-[#3a34d3] text-white hover:bg-[#5452ec]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {showAddLink ? 'close' : 'add_circle'}
                  </span>
                  <span>{showAddLink ? 'Fechar' : 'Adicionar'}</span>
                </button>
              )}
            </div>

            {/* Add link form (teacher only) */}
            {isTeacher && showAddLink && (
              <form
                onSubmit={handleAddLink}
                className="bg-[#131d2b] border border-[#3a34d3]/50 rounded-2xl p-4 space-y-3"
              >
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#3a34d3] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px]">add_link</span>
                  Novo link
                </span>

                <input
                  type="text"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="Nome do recurso (ex: Simulador de Volumes)"
                  className="w-full text-[13px] px-3.5 py-2.5 bg-[#0b131e] border border-white/15 rounded-xl focus:outline-none focus:border-[#3a34d3] placeholder:text-white/30 text-white"
                />
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="URL (https://...)"
                  className="w-full text-[13px] px-3.5 py-2.5 bg-[#0b131e] border border-white/15 rounded-xl focus:outline-none focus:border-[#3a34d3] placeholder:text-white/30 text-white"
                />
                <input
                  type="text"
                  value={linkTag}
                  onChange={(e) => setLinkTag(e.target.value)}
                  placeholder="Etiqueta (ex: Treino)"
                  className="w-full text-[13px] px-3.5 py-2.5 bg-[#0b131e] border border-white/15 rounded-xl focus:outline-none focus:border-[#3a34d3] placeholder:text-white/30 text-white"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#005d3e] hover:bg-[#007852] text-white font-bold text-[12px] flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_link</span>
                    Adicionar link
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddLink(false);
                      setLinkTitle('');
                      setLinkUrl('');
                      setLinkTag('');
                    }}
                    className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[12px] transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {/* External links */}
            {links.length > 0 ? (
              links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-[#131d2b] border border-white/10 rounded-2xl p-3.5 flex items-center gap-3 transition-all hover:border-[#3a34d3]/60 hover:bg-[#161f30]"
              >
                <div className="w-11 h-11 rounded-xl bg-[#1b2537] text-[#6ffbbe] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">{link.icon || 'link'}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-bold text-white truncate">{link.title}</p>
                    {link.tag && (
                      <span className="px-1.5 py-0.5 rounded bg-[#3a34d3]/30 text-[#b6c0ff] text-[8px] font-extrabold uppercase shrink-0">
                        {link.tag}
                      </span>
                    )}
                  </div>
                  {link.description && (
                    <p className="text-[11px] text-[#c7c4d8] leading-snug mt-0.5 line-clamp-1">
                      {link.description}
                    </p>
                  )}
                </div>
                <span className="material-symbols-outlined text-[18px] text-[#6ffbbe] shrink-0">
                  open_in_new
                </span>
              </a>
              ))
            ) : (
              <div className="text-center py-10 text-[12px] text-[#c7c4d8]">
                Nenhum link adicionado ainda.
              </div>
            )}

            <p className="text-center text-[10px] text-[#c7c4d8]/70 pt-1">
              Links externos abrem em uma nova aba do navegador.
            </p>
          </section>
        )}

        {/* PARTICIPANTS TAB */}
        {activeTab === 'participantes' && (
          <section className="h-full overflow-y-auto">
            {/* Live attention panel */}
            <div className="p-4 pb-2">
              <div className="bg-[#131d2b] border border-white/10 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#ffb77c] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">visibility</span>
                    Atenção ao vivo
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      attention.awayCount > 0
                        ? 'bg-[#b22200]/30 text-[#ffb77c] animate-pulse'
                        : 'bg-[#6ffbbe]/20 text-[#6ffbbe]'
                    }`}
                  >
                    {attention.awayCount > 0
                      ? `${attention.awayCount} ausente(s) agora`
                      : 'Todos focados'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {attention.attendees.map((a) => (
                    <div key={a.tabId} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            a.isAway ? 'bg-[#ff5a4e] animate-pulse' : 'bg-[#6ffbbe]'
                          }`}
                        ></span>
                        <div className="min-w-0">
                          <p className="text-[12px] font-bold text-white truncate">{a.userName}</p>
                          <p className="text-[9px] uppercase font-extrabold text-[#c7c4d8]">
                            {a.role === 'professor' ? 'Docente' : 'Aluno'}
                            {attention.totalAwayFor(a.userName) > 0 && (
                              <span className="text-[#ffb77c] normal-case">
                                {' '}
                                · {formatDuration(attention.totalAwayFor(a.userName))} fora
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold shrink-0 ${
                          a.isAway ? 'text-[#ff5a4e]' : 'text-[#6ffbbe]'
                        }`}
                      >
                        {a.isAway
                          ? `Ausente ${formatDuration(Date.now() - (a.awaySince || Date.now()))}`
                          : 'Presente'}
                      </span>
                    </div>
                  ))}
                  {attention.attendees.length === 0 && (
                    <p className="text-[11px] text-[#c7c4d8]/80">
                      Nenhum participante ativo neste dispositivo. Abra o +Foco em outra aba com o
                      perfil de aluno para ver a atenção em tempo real.
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-2">
                  <span className="text-[10px] text-[#c7c4d8] font-bold">
                    Tempo total fora da aula
                  </span>
                  <span className="text-[10px] font-mono font-bold text-white">
                    {formatDuration(attention.totalAwayMs)}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-4 pb-2 flex items-center justify-between text-[12px] font-bold text-[#c7c4d8]">
              <span>Presentes na sala ({participants.length})</span>
              {handRaisedStudents.length > 0 && (
                <span className="text-[#ffb77c]">
                  {handRaisedStudents.length} mão(s) levantada(s) ✋
                </span>
              )}
            </div>

            <div className="px-4 pb-4 space-y-1.5">
              {participants.map((p) => {
                const isHost = p.role === 'professor';

                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={p.avatar}
                          alt={p.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-white/20"
                          referrerPolicy="no-referrer"
                        />
                        {p.handRaised && (
                          <span className="absolute -top-1 -right-1 text-[12px] animate-bounce">✋</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-[12px] font-bold text-white truncate">{p.name}</p>
                        <p className="text-[10px] text-[#c7c4d8] truncate">
                          {isHost ? 'Docente (Host)' : p.desk || 'Aluno'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* 4. BOTTOM FLOATING CONTROLS BAR */}
      <footer className="h-18 sm:h-20 bg-[#0d1624]/95 backdrop-blur-xl border-t border-white/10 px-4 flex items-center justify-center gap-3 sm:gap-4 shrink-0 z-30 pb-safe">
        {/* Student Raise Hand (teacher ends the room via "Fechar Sala") */}
        {!isTeacher && (
          <button
            onClick={handleToggleHand}
            className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95 shadow-md ${
              hasHandRaised
                ? 'bg-[#ffb77c] text-[#4f2500] animate-bounce'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title="Levantar a mão para pedir a palavra"
          >
            <span className="material-symbols-outlined text-[22px]">front_hand</span>
            <span className="text-[8px] font-bold mt-0.5">{hasHandRaised ? 'Pedindo' : 'Mão'}</span>
          </button>
        )}

        {/* End / Close room — teacher only; students are locked until the teacher closes the room */}
        {isTeacher ? (
          <button
            onClick={() => {
              if (onEndRoomAsTeacher) onEndRoomAsTeacher();
              onLeaveRoom();
            }}
            className="h-12 px-4 rounded-2xl bg-[#b22200] hover:bg-[#8f1b00] text-white font-bold text-[12px] flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all"
            title="Fechar a sala para toda a turma (novo código será gerado)"
          >
            <span className="material-symbols-outlined text-[20px]">stop_circle</span>
            <span>Fechar Sala</span>
          </button>
        ) : (
          <div
            className="h-12 px-4 rounded-2xl bg-[#3a34d3]/20 border border-[#3a34d3]/40 text-[#b6c0ff] font-bold text-[10px] flex items-center justify-center gap-1.5 shrink-0"
            title="Você não pode sair até o professor encerrar a aula"
          >
            <span className="material-symbols-outlined text-[18px]">lock</span>
            <span className="leading-tight">
              Em aula
              <br />
              sem sair
            </span>
          </div>
        )}
      </footer>

      {/* Image Preview Lightbox */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[70] bg-black/85 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="bg-white rounded-2xl p-2 max-w-lg max-h-[85vh] overflow-hidden">
            <img
              src={previewImage}
              alt="Visualização do Material"
              className="w-full h-auto max-h-[75vh] object-contain rounded-xl"
              referrerPolicy="no-referrer"
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