import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getDb, initAuth } from '../firebase';
import { UserProfile, UserRole } from '../types';
import { APP_IMAGES } from '../data/mockData';

export interface SignUpInput {
  role: UserRole;
  name: string;
  email: string;
  password: string;
  details: string;
  subject?: string;
  room?: string;
  classGroup?: string;
}

interface ProfileDoc {
  nome?: string;
  tipo?: UserRole;
  name?: string;
  role?: UserRole;
  avatar?: string;
  details?: string;
  subject?: string;
  room?: string;
  classGroup?: string;
  email?: string;
}

const AUTH_ERRORS: Record<string, string> = {
  'auth/email-already-in-use': 'Este e-mail já está cadastrado. Faça login.',
  'auth/invalid-email': 'E-mail inválido. Confira e tente novamente.',
  'auth/weak-password': 'Senha muito fraca. Use pelo menos 6 caracteres.',
  'auth/user-not-found': 'Nenhuma conta encontrada para este e-mail.',
  'auth/wrong-password': 'Senha incorreta. Tente novamente.',
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco e tente de novo.',
  'auth/network-request-failed': 'Sem conexão com a internet. Verifique sua rede.',
  'auth/internal-error': 'Erro inesperado. Tente novamente.',
  'auth/operation-not-allowed':
    'Cadastro com e-mail/senha desativado. Ative em Firebase Console > Authentication > Sign-in method > E-mail/Senha.',
  'auth/unauthorized-domain':
    'Domínio não autorizado. Adicione este domínio em Firebase Console > Authentication > Authorized domains.',
  'auth/popup-closed-by-user': 'Janela de login fechada antes de concluir.'
};

export function authErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code ?? (error as { message?: string })?.message;
  if (!code) return 'Não foi possível completar a operação. Tente novamente.';
  if (AUTH_ERRORS[code]) return AUTH_ERRORS[code];
  if (typeof code === 'string' && code.startsWith('auth/')) {
    return code;
  }
  return 'Não foi possível completar a operação. Tente novamente.';
}

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))
  ]);
}

const PROFILE_CACHE_PREFIX = 'foco:profile:';

function cacheProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_CACHE_PREFIX + profile.id, JSON.stringify(profile));
  } catch {
    // localStorage indisponível (modo privado, etc.) — ignora.
  }
}

function loadCachedProfile(uid: string): UserProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_PREFIX + uid);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.role === 'string' && typeof parsed.name === 'string') {
      return parsed as UserProfile;
    }
  } catch {
    // Cache corrompido — ignora.
  }
  return null;
}

function fallbackProfile(user: FirebaseUser, roleHint?: UserRole): UserProfile {
  const cached = loadCachedProfile(user.uid);
  // O papel escolhido na tela de login (ex.: "Sou Professor") tem prioridade sobre
  // um cache antigo — impede que um cache desatualizado de 'aluno' redirecione um
  // professor para a Sala Virtual.
  const role = roleHint ?? cached?.role ?? 'aluno';
  const baseName = user.email?.split('@')[0] ?? 'usuario';
  // Só reaproveita o nome/avatar do cache se o papel do cache bater com o papel final.
  const matchesRole = cached && cached.role === role;
  return {
    id: user.uid,
    role,
    name: matchesRole ? cached.name : user.displayName ?? baseName,
    avatar:
      (matchesRole ? cached.avatar : undefined) ??
      (role === 'professor' ? APP_IMAGES.teachers.ricardoMendes : APP_IMAGES.userProfile),
    details: matchesRole ? cached.details ?? '' : 'Conta criada pelo e-mail',
    subject: matchesRole ? cached.subject : undefined,
    room: matchesRole ? cached.room : undefined,
    classGroup: matchesRole ? cached.classGroup : undefined,
    email: user.email ?? ''
  };
}

export async function loadProfile(user: FirebaseUser, roleHint?: UserRole): Promise<UserProfile> {
  const fallback = fallbackProfile(user, roleHint);
  try {
    const snap = await withTimeout(getDoc(doc(getDb(), 'usuarios', user.uid)), 4000, null);
    if (snap && snap.exists()) {
      const data = snap.data() as ProfileDoc;
      const role = data.tipo ?? data.role ?? 'aluno';
      const name = data.nome ?? data.name ?? user.email?.split('@')[0] ?? 'Estudante';
      const profile: UserProfile = {
        id: user.uid,
        role,
        name,
        avatar: data.avatar ?? (role === 'professor' ? APP_IMAGES.teachers.ricardoMendes : APP_IMAGES.userProfile),
        details: data.details ?? '',
        subject: data.subject,
        room: data.room,
        classGroup: data.classGroup,
        email: data.email ?? user.email ?? ''
      };
      cacheProfile(profile);
      return profile;
    }
  } catch {
    // Se o Firestore estiver indisponível, usa o papel escolhido + cache local.
  }
  cacheProfile(fallback);
  return fallback;
}

export async function signUp(input: SignUpInput): Promise<UserProfile> {
  const auth = await initAuth();
  const trimmedEmail = input.email.trim();
  const credential = await createUserWithEmailAndPassword(auth, trimmedEmail, input.password);

  const role = input.role;
  const name = input.name.trim();
  const profile: UserProfile = {
    id: credential.user.uid,
    role,
    name,
    avatar: role === 'professor' ? APP_IMAGES.teachers.ricardoMendes : APP_IMAGES.userProfile,
    details: input.details,
    subject: input.subject,
    room: input.room,
    classGroup: input.classGroup,
    email: trimmedEmail
  };

  // Gravação do perfil não bloqueia o login: ocorre em segundo plano.
  setDoc(doc(getDb(), 'usuarios', credential.user.uid), {
    nome: name,
    email: trimmedEmail,
    tipo: role,
    criadoEm: serverTimestamp(),
    avatar: profile.avatar,
    details: input.details,
    subject: input.subject,
    room: input.room,
    classGroup: input.classGroup
  }).catch(() => {});

  // Cache local garante que o papel (professor/aluno) persista mesmo sem Firestore.
  cacheProfile(profile);

  return profile;
}

export async function signIn(
  email: string,
  password: string,
  roleHint?: UserRole
): Promise<UserProfile> {
  const auth = await initAuth();
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);

  // Exclusividade de papel: a conta só aceita entrar pela aba correspondente
  // ("Sou Aluno" ↔ aluno, "Sou Professor" ↔ professor). Se o papel real da conta
  // (cache local do cadastro/login anterior) divergir da aba escolhida, o acesso
  // é bloqueado com instrução clara — impede aluno de cair no painel docente.
  if (roleHint) {
    const cached = loadCachedProfile(credential.user.uid);
    let realRole = cached?.role;
    if (!realRole) {
      // Sem cache (ex.: primeiro acesso neste aparelho), verifica o papel
      // definitivo registrado no Firestore no momento do cadastro.
      try {
        const snap = await withTimeout(
          getDoc(doc(getDb(), 'usuarios', credential.user.uid)),
          3000,
          null
        );
        if (snap && snap.exists()) {
          const data = snap.data() as ProfileDoc;
          realRole = data.tipo ?? data.role;
        }
      } catch {
        // Firestore indisponível — segue com o papel escolhido como fallback.
      }
    }
    if (realRole && realRole !== roleHint) {
      if (realRole === 'aluno') {
        throw new Error(
          'Esta conta é de um ALUNO. Para entrar como aluno, selecione "Sou Aluno" e faça o login.'
        );
      }
      throw new Error(
        'Esta conta é de um PROFESSOR. Para entrar como docente, selecione "Sou Professor" e faça o login.'
      );
    }
  }

  const profile = await loadProfile(credential.user, roleHint);
  cacheProfile(profile);
  return profile;
}

export function onAuthChange(cb: (user: FirebaseUser | null) => void): () => void {
  let unsub: (() => void) | null = null;
  let cancelled = false;
  initAuth()
    .then((auth) => {
      if (cancelled) return;
      unsub = onAuthStateChanged(auth, cb);
    })
    .catch((err) => {
      console.warn('[auth] Falha ao inicializar autenticação.', err);
    });
  return () => {
    cancelled = true;
    unsub?.();
  };
}

export async function logOut(): Promise<void> {
  const auth = await initAuth();
  await signOut(auth);
}