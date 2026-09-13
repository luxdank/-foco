export type TabType = 'hoje' | 'salas' | 'turma' | 'eu' | 'foco-ativo' | 'sala-virtual';

export type MoodType = 'pique' | 'focado' | 'cafe';

export interface Subject {
  id: string;
  name: string;
  category: string; // Exatas, Humanas, Ciências da Natureza, Biológicas, Linguagens
  categoryColor: string;
  teacher: {
    name: string;
    avatar: string;
  };
  room: string;
  schedule: string;
  isLiveNow?: boolean;
  liveBadgeText?: string;
  statusBadge?: string;
  pendingTask?: {
    title: string;
    deadline: string;
    urgent?: boolean;
    type?: string;
  };
  progress: number;
  progressLabel?: string;
  iconName: string;
  themeColor: string;
  activeDiscussion?: string;
  groupProject?: string;
  recommendedReading?: {
    title: string;
    format: string;
  };
}

export interface Task {
  id: string;
  subject: string;
  title: string;
  tag: string;
  tagType: 'primary' | 'secondary' | 'neutral';
  deadline: string;
  detail: string;
  progressPercent?: number;
  type: 'quiz' | 'audio' | 'text';
}

export type UserRole = 'aluno' | 'professor';

export interface UserProfile {
  id: string;
  role: UserRole;
  name: string;
  avatar: string;
  details: string;
  subject?: string;
  room?: string;
  email?: string;
  classGroup?: string;
}

export interface DoubtItem {
  id: string;
  studentName: string;
  studentAvatar: string;
  table: string;
  subject: string;
  topic: string;
  question?: string;
  time: string;
  status: 'pendente' | 'em_atendimento' | 'resolvido';
}

export interface ActivitySubmission {
  id: string;
  activityId?: string;
  studentName: string;
  pairName?: string;
  subject: string;
  activityTitle: string;
  answer: string;
  stepWork?: string;
  status: 'pendente' | 'aprovado' | 'ajuste';
  feedback?: string;
  submittedAt: string;
}

export interface ImageAssetInfo {
  id: string;
  title: string;
  description: string;
  url: string;
  htmlSnippet: string;
  category: 'logo' | 'perfil' | 'professores' | 'colegas';
}

export type AttachmentType = 'pdf' | 'image' | 'link';

export interface AttachmentItem {
  id: string;
  type: AttachmentType;
  title: string;
  url: string;
  fileSize?: string;
  previewUrl?: string;
}

export interface TeacherActivity {
  id: string;
  title: string;
  subject: string;
  teacherName: string;
  classGroup: string;
  description: string;
  deadline: string;
  points: number;
  mode: 'individual' | 'dupla' | 'grupo';
  attachments: AttachmentItem[];
  createdAt: string;
  status: 'aberta' | 'em_andamento' | 'concluida';
}

export interface VirtualRoomParticipant {
  id: string;
  name: string;
  avatar: string;
  role: 'aluno' | 'professor';
  desk?: string;
  isMuted: boolean;
  isVideoOn: boolean;
  handRaised: boolean;
  reaction?: string;
}

export interface VirtualRoomMessage {
  id: string;
  senderUserId?: string;
  senderName: string;
  senderAvatar: string;
  senderRole: 'aluno' | 'professor';
  text: string;
  time: string;
  isPrivateToTeacher?: boolean;
}

export interface VirtualRoomInfo {
  id: string;
  subject: string;
  teacherName: string;
  teacherAvatar?: string;
  roomName: string;
  accessCode: string;
  nativeLink: string;
  meetUrl?: string;
  isActive: boolean;
  platform: 'foco_live' | 'google_meet' | 'zoom' | 'teams';
  startedAt?: string;
  topicDescription?: string;
  presentationMode?: 'lousa' | 'camera' | 'slides';
  activeSlide?: number;
}

export interface RoomPollOption {
  id: string;
  label: string;
  votes: number;
}

export interface RoomPoll {
  id: string;
  question: string;
  options: RoomPollOption[];
  isOpen: boolean;
  createdAt: string;
  createdBy: string;
}

export interface RoomMaterial {
  id: string;
  title: string;
  type: AttachmentType | 'slides';
  description?: string;
  fileSize?: string;
  url: string;
  previewUrl?: string;
}

export interface RoomLink {
  id: string;
  title: string;
  description?: string;
  url: string;
  icon?: string;
  tag?: string;
}
