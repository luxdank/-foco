import React, { useState, useEffect } from 'react';
import {
  TabType,
  Subject,
  UserProfile,
  DoubtItem,
  ActivitySubmission,
  TeacherActivity,
  VirtualRoomInfo
} from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ImageLinksModal } from './components/ImageLinksModal';
import { QuickDoubtModal } from './components/QuickDoubtModal';
import { ActivityModal } from './components/ActivityModal';
import { MaterialsModal } from './components/MaterialsModal';
import { CreateActivityModal } from './components/CreateActivityModal';
import { VirtualRoomModal } from './components/VirtualRoomModal';
import { HojeScreen } from './screens/HojeScreen';
import { SalasScreen } from './screens/SalasScreen';
import { FocoAtivoScreen } from './screens/FocoAtivoScreen';
import { TurmaScreen } from './screens/TurmaScreen';
import { EuScreen } from './screens/EuScreen';
import { LoginScreen } from './screens/LoginScreen';
import { ProfessorScreen } from './screens/ProfessorScreen';
import { SalaVirtualScreen } from './screens/SalaVirtualScreen';
import { EntrarSalaScreen } from './screens/EntrarSalaScreen';
import { useRoomRegistry } from './lib/roomRegistry';
import { loadProfile, logOut, onAuthChange } from './lib/auth';
import {
  DEFAULT_USERS,
  INITIAL_DOUBTS,
  INITIAL_SUBMISSIONS,
  INITIAL_TEACHER_ACTIVITIES,
  INITIAL_VIRTUAL_ROOMS
} from './data/mockData';

export default function App() {
  // Authentication & User State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_USERS.teachers[0]);

  // Navigation State
  const [currentTab, setCurrentTab] = useState<TabType>('salas');

  // Interactive Live Data State (Shared across student and teacher views)
  const [doubts, setDoubts] = useState<DoubtItem[]>(INITIAL_DOUBTS);
  const [submissions, setSubmissions] = useState<ActivitySubmission[]>(INITIAL_SUBMISSIONS);
  const [activities, setActivities] = useState<TeacherActivity[]>(INITIAL_TEACHER_ACTIVITIES);
  // Salas virtuais criadas/ajustadas pelo professor (sincronizadas via Firestore +
  // fallback local). É este registro que faz a requisição do código do aluno "se
  // comunicar" com a sala criada/aberta pelo professor.
  const { rooms: virtualRooms, saveRoom: publishRoom } = useRoomRegistry();
  const [activityDone, setActivityDone] = useState<boolean>(false);

  // Aluno: sala que ele resolveu pelo código digitado (id resolve o estado ao vivo)
  const [joinedRoomId, setJoinedRoomId] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const joinedRoom = joinedRoomId
    ? virtualRooms.find((r) => r.id === joinedRoomId) || null
    : null;

  // Toda vez que a sala é fechada pelo professor, o código muda — o aluno com o
  // código antigo é liberado e volta para a tela de entrada pedindo o novo código.
  useEffect(() => {
    if (!joinedRoomId) return;
    if (!joinedRoom || !joinedRoom.isActive) {
      setJoinedRoomId(null);
      setJoinError(
        'A sala foi encerrada pelo professor e o código foi atualizado. Peça o novo código ao professor para entrar novamente.'
      );
    }
  }, [joinedRoomId, joinedRoom]);

  const generateRoomCode = () =>
    'FOCO-' +
    Math.random().toString(36).substring(2, 5).toUpperCase() +
    '-' +
    Math.floor(10 + Math.random() * 90);

  // Active virtual room for mathematics / current teacher
  const currentVirtualRoom = virtualRooms[0] || INITIAL_VIRTUAL_ROOMS[0];

  // Modals & Dialogs
  const [showImageGallery, setShowImageGallery] = useState<boolean>(false);
  const [showQuickDoubt, setShowQuickDoubt] = useState<boolean>(false);
  const [showActivityModal, setShowActivityModal] = useState<boolean>(false);
  const [showMaterialsModal, setShowMaterialsModal] = useState<boolean>(false);
  const [showCreateActivityModal, setShowCreateActivityModal] = useState<boolean>(false);
  const [showVirtualRoomModal, setShowVirtualRoomModal] = useState<boolean>(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  // Floating Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Restaura sessão mantida pelo Firebase (recarrega a página já logado).
  useEffect(() => {
    const unsub = onAuthChange((user) => {
      if (!user) {
        setIsAuthenticated(false);
        return;
      }
      loadProfile(user)
        .then((profile) => {
          setCurrentUser(profile);
          setIsAuthenticated(true);
        })
        .catch(() => {
          setIsAuthenticated(true);
        });
    });
    return unsub;
  }, []);

  // Login handler
  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setJoinedRoomId(null);
    setJoinError(null);
    setIsAuthenticated(true);
    if (user.role === 'professor') {
      setCurrentTab('salas');
      triggerToast(`Bem-vindo, ${user.name}! Painel docente ativado.`);
    } else {
      setCurrentTab('sala-virtual');
      triggerToast(`Olá, ${user.name}! Bons estudos.`);
    }
  };

  // Logout handler
  const handleLogout = () => {
    logOut().catch(() => {});
    setJoinedRoomId(null);
    setJoinError(null);
    setIsAuthenticated(false);
    triggerToast('Sessão finalizada com sucesso.');
  };

  const handleOpenMaterials = (subject: Subject) => {
    setSelectedSubject(subject);
    setShowMaterialsModal(true);
  };

  // Student submits activity
  const handleActivitySubmit = (answer: string, stepWork: string) => {
    setActivityDone(true);
    const newSubmission: ActivitySubmission = {
      id: `sub-${Date.now()}`,
      studentName: currentUser.name,
      pairName: 'Mariana Duarte',
      subject: 'Matemática',
      activityTitle: 'Cálculo de Volume (Pág. 42)',
      answer,
      stepWork,
      status: 'pendente',
      submittedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
    setSubmissions((prev) => [newSubmission, ...prev]);
    triggerToast('Atividade enviada! O professor já pode avaliar no painel.');
  };

  // Student sends a doubt (discreet)
  const handleSendDoubt = (topic: string, question: string) => {
    const newDoubt: DoubtItem = {
      id: `doubt-${Date.now()}`,
      studentName: currentUser.name,
      studentAvatar: currentUser.avatar,
      subject: 'Matemática',
      table: 'Mesa 04',
      topic,
      question,
      status: 'pendente',
      time: 'Agora mesmo'
    };
    setDoubts((prev) => [newDoubt, ...prev]);
    triggerToast('Dúvida sinalizada discretamente na mesa do professor!');
  };

  // Teacher updates doubt status
  const handleUpdateDoubtStatus = (
    doubtId: string,
    status: 'pendente' | 'em_atendimento' | 'resolvido'
  ) => {
    setDoubts((prev) =>
      prev.map((d) => (d.id === doubtId ? { ...d, status } : d))
    );
    if (status === 'em_atendimento') {
      triggerToast('Mesa marcada como Em Atendimento!');
    } else if (status === 'resolvido') {
      triggerToast('Dúvida concluída!');
    }
  };

  // Teacher reviews and scores submission
  const handleReviewSubmission = (
    submissionId: string,
    status: 'aprovado' | 'ajuste',
    feedback?: string
  ) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === submissionId ? { ...s, status, feedback } : s))
    );
    if (status === 'aprovado') {
      triggerToast('Atividade aprovada com sucesso! Nota e feedback enviados ao aluno.');
    } else {
      triggerToast('Solicitação de ajuste enviada para a dupla.');
    }
  };

  // Teacher creates custom activity with attachments (PDF, images, links)
  const handleSaveActivity = (newActivity: TeacherActivity) => {
    setActivities((prev) => [newActivity, ...prev]);
    triggerToast(`Atividade "${newActivity.title}" criada com ${newActivity.attachments.length} anexo(s)!`);
  };

  // Student or Teacher enters the Native Virtual Room. Para o professor, o botão é
  // "Abrir a sala": garante que a sala está ATIVA (aberta) antes de entrar como Host.
  const handleEnterVirtualRoom = (asRole?: 'aluno' | 'professor') => {
    if (asRole === 'aluno' && currentUser.role !== 'aluno') {
      setCurrentUser(DEFAULT_USERS.students[0]);
      setJoinedRoomId(null);
      setJoinError(null);
    } else if (asRole === 'professor' && currentUser.role !== 'professor') {
      setCurrentUser(DEFAULT_USERS.teachers[0]);
    }
    if (asRole === 'professor') {
      const room = virtualRooms.find((r) => r.id === currentVirtualRoom.id) || currentVirtualRoom;
      if (!room.isActive) {
        publishRoom({
          ...room,
          isActive: true,
          startedAt:
            room.startedAt ||
            new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        });
      }
    }
    setCurrentTab('sala-virtual');
    triggerToast(
      asRole === 'professor'
        ? 'Abrindo a Sala Virtual Nativa como Docente (Host)...'
        : 'Conectando à Sala Virtual Nativa com seu perfil de Aluno...'
    );
  };

  // Teacher configures / updates virtual room (published to the shared registry)
  const handleSaveVirtualRoom = (updatedRoom: VirtualRoomInfo, notifyStudents: boolean) => {
    publishRoom(updatedRoom);
    if (notifyStudents) {
      triggerToast(`🔴 Sala Virtual Nativa aberta! Código: ${updatedRoom.accessCode}`);
    } else {
      triggerToast('Configurações da Sala Virtual salvas.');
    }
  };

  // Teacher toggles virtual room on/off. Ao FECHAR a sala, o código é atualizado
// automaticamente — o código antigo deixa de valer para os alunos.
  const handleToggleVirtualRoom = () => {
    const target = virtualRooms.find((r) => r.id === currentVirtualRoom.id) || currentVirtualRoom;
    const nextActive = !target.isActive;
    const accessCode = nextActive ? target.accessCode : generateRoomCode();
    publishRoom({
      ...target,
      isActive: nextActive,
      accessCode,
      nativeLink: `https://foco.app/sala/${accessCode}`,
      startedAt: nextActive
        ? target.startedAt ||
          new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        : target.startedAt
    });
    triggerToast(
      nextActive
        ? 'Sala Virtual aberta com sucesso!'
        : `Sala encerrada. Novo código gerado: ${accessCode}`
    );
  };

  // Aluno envia o código da sala criada pelo professor → a requisição é resolvida
  // contra o registro compartilhado das salas.
  const handleJoinRoom = (code: string) => {
    const trimmed = code.trim();
    setJoinError(null);
    const found = virtualRooms.find(
      (r) => r.accessCode.toLowerCase() === trimmed.toLowerCase()
    );
    if (!found) {
      setJoinError(
        `Código "${trimmed}" não encontrado. Confira com o professor e tente novamente.`
      );
      return;
    }
    if (!found.isActive) {
      setJoinError(
        `A sala "${found.roomName}" está fechada no momento. Aguarde o professor abrir a sala.`
      );
      return;
    }
    setJoinedRoomId(found.id);
    triggerToast(`Conectando à sala "${found.roomName}"... Código aceito!`);
  };

  // If unauthenticated, show LoginScreen
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const isProfessor = currentUser.role === 'professor';
  // Para o aluno, a única tela que permanece é a Sala Virtual (sem navegação).
  const isStudent = !isProfessor;
  const isSalaVirtual = isStudent || currentTab === 'sala-virtual';
  const handleLeaveRoom = () => {
    if (isProfessor) {
      setCurrentTab('salas');
    } else {
      // O aluno só sai da sala depois que o professor encerra/autoriza.
      handleLogout();
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#0b1c30] flex flex-col relative">
      {/* Header with App Logo, Identity, Switcher & Quick Actions (hidden when inside full-screen virtual room) */}
      {!isSalaVirtual && (
        <Header
          currentTab={currentTab}
          currentUser={currentUser}
          onNavigateHome={() => setCurrentTab(isProfessor ? 'salas' : 'hoje')}
        />
      )}

      {/* Floating System Toast */}
      {toastMessage && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-[#0b1c30] text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 border border-[#3a34d3]/50 max-w-sm text-[13px] animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#6ffbbe] animate-ping shrink-0"></span>
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Full-Screen Native Virtual Room / Student join-by-code flow */}
      {isStudent ? (
        joinedRoom ? (
          <SalaVirtualScreen
            virtualRoom={joinedRoom}
            currentUser={currentUser}
            onLeaveRoom={handleLeaveRoom}
            onSendDoubtToTeacher={handleSendDoubt}
            onEndRoomAsTeacher={handleToggleVirtualRoom}
          />
        ) : (
          <EntrarSalaScreen error={joinError} onSubmit={handleJoinRoom} onLogout={handleLogout} />
        )
      ) : isSalaVirtual ? (
        <SalaVirtualScreen
          virtualRoom={currentVirtualRoom}
          currentUser={currentUser}
          onLeaveRoom={handleLeaveRoom}
          onSendDoubtToTeacher={handleSendDoubt}
          onEndRoomAsTeacher={handleToggleVirtualRoom}
        />
      ) : null}

      {/* Main Content Area (Mobile-First, fluid max-w-md or responsive container) */}
      {!isSalaVirtual && (
        <main className="flex-1 w-full max-w-md mx-auto pt-20 px-3.5 sm:px-4 min-h-screen">
          {/* If user is Professor, show the ProfessorScreen (or Profile when on 'eu') */}
          {isProfessor ? (
            currentTab === 'eu' ? (
              <EuScreen
                currentUser={currentUser}
                onOpenImageGallery={() => setShowImageGallery(true)}
                onLogout={handleLogout}
              />
            ) : (
              <ProfessorScreen
                currentUser={currentUser}
                activities={activities}
                virtualRoom={currentVirtualRoom}
                onOpenVirtualRoomModal={() => setShowVirtualRoomModal(true)}
                onToggleVirtualRoom={handleToggleVirtualRoom}
                onEnterVirtualRoom={() => handleEnterVirtualRoom('professor')}
                onLogout={handleLogout}
              />
            )
          ) : (
            /* Student Views */
            <>
              {currentTab === 'hoje' && (
                <HojeScreen
                  onNavigate={setCurrentTab}
                  onOpenQuickDoubt={() => setShowQuickDoubt(true)}
                  virtualRoom={currentVirtualRoom}
                  onEnterVirtualRoom={() => handleEnterVirtualRoom('aluno')}
                />
              )}

              {currentTab === 'salas' && (
                <SalasScreen
                  onNavigate={setCurrentTab}
                  onOpenMaterials={handleOpenMaterials}
                  activities={activities}
                  virtualRoom={currentVirtualRoom}
                  onEnterVirtualRoom={() => handleEnterVirtualRoom('aluno')}
                />
              )}

              {currentTab === 'foco-ativo' && (
                <FocoAtivoScreen
                  onOpenActivityModal={() => setShowActivityModal(true)}
                  activityDone={activityDone}
                  onSendDoubt={handleSendDoubt}
                  onSendPulse={(feedback) =>
                    triggerToast(`Pulso registrado: ${feedback}. Obrigado!`)
                  }
                  studentName={currentUser.name}
                />
              )}

              {currentTab === 'turma' && <TurmaScreen />}

              {currentTab === 'eu' && (
                <EuScreen
                  currentUser={currentUser}
                  onOpenImageGallery={() => setShowImageGallery(true)}
                  onLogout={handleLogout}
                />
              )}
            </>
          )}
        </main>
      )}

      {/* Persistent Bottom Floating Navigation (shown for students on non-foco, non-room tabs) */}
      {!isProfessor && !isSalaVirtual && currentTab !== 'foco-ativo' && (
        <BottomNav currentTab={currentTab} onNavigate={setCurrentTab} />
      )}

      {/* Modals & Dialogs */}
      <ImageLinksModal
        isOpen={showImageGallery}
        onClose={() => setShowImageGallery(false)}
      />

      <QuickDoubtModal
        isOpen={showQuickDoubt}
        onClose={() => setShowQuickDoubt(false)}
        onSendDoubt={handleSendDoubt}
      />

      <ActivityModal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        onSuccess={() => setActivityDone(true)}
        onSubmitActivity={handleActivitySubmit}
      />

      <MaterialsModal
        isOpen={showMaterialsModal}
        onClose={() => setShowMaterialsModal(false)}
        subject={selectedSubject}
        activities={activities}
      />

      <CreateActivityModal
        isOpen={showCreateActivityModal}
        onClose={() => setShowCreateActivityModal(false)}
        onSaveActivity={handleSaveActivity}
        defaultSubject={currentUser.subject || 'Matemática'}
        teacherName={currentUser.name}
      />

      <VirtualRoomModal
        isOpen={showVirtualRoomModal}
        onClose={() => setShowVirtualRoomModal(false)}
        currentRoom={currentVirtualRoom}
        onSaveRoom={handleSaveVirtualRoom}
        onEnterNativeRoom={() => handleEnterVirtualRoom('professor')}
      />
    </div>
  );
}
