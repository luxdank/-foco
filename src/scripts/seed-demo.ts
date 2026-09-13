import { APP_IMAGES } from '../data/mockData';

const API_KEY = 'AIzaSyBYyNbB_47_1SX1Kp0BsEOyYfv0Zbd7lec';
const PROJECT_ID = 'videira-coffe';

interface DemoAccount {
  role: 'aluno' | 'professor';
  name: string;
  email: string;
  password: string;
  details: string;
  subject?: string;
  room?: string;
  classGroup: string;
  avatar: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'aluno',
    name: 'Lucas Andrade',
    email: 'lucas.andrade@escola.edu.br',
    password: 'FocoDemo123!',
    details: 'Matrícula: 2024-8841 • Foco em Exatas & Vestibular',
    classGroup: '3º Ano A',
    avatar: APP_IMAGES.userProfile
  },
  {
    role: 'aluno',
    name: 'Mariana Duarte',
    email: 'mariana.duarte@escola.edu.br',
    password: 'FocoDemo123!',
    details: 'Matrícula: 2024-8842 • Líder de Turma',
    classGroup: '3º Ano A',
    avatar: APP_IMAGES.peers[0]
  },
  {
    role: 'professor',
    name: 'Prof. Ricardo Mendes',
    email: 'ricardo.mendes@escola.edu.br',
    password: 'FocoDemo123!',
    details: 'Matemática & Geometria Espacial • Sala 04-B',
    subject: 'Matemática',
    room: 'Sala 04-B',
    classGroup: '3º Ano A',
    avatar: APP_IMAGES.teachers.ricardoMendes
  }
];

async function createAuthUser(account: DemoAccount): Promise<string> {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: account.email,
        password: account.password,
        returnSecureToken: true
      })
    }
  );
  const data = await res.json();
  if (!res.ok) {
    if ((data.error as { message?: string })?.message === 'EMAIL_EXISTS') {
      console.log(`  já existe: ${account.email}`);
      return data.error?.message === 'EMAIL_EXISTS' ? '' : '';
    }
    throw new Error(`[auth] ${account.email} -> ${data.error?.message ?? res.status}`);
  }
  console.log(`  criada: ${account.email} (uid ${data.localId})`);
  return data.localId as string;
}

async function seedFirestoreProfile(account: DemoAccount, uid: string) {
  const fields: Record<string, { stringValue?: string; timestampValue?: string }> = {
    nome: { stringValue: account.name },
    email: { stringValue: account.email },
    tipo: { stringValue: account.role },
    criadoEm: { timestampValue: new Date().toISOString() },
    avatar: { stringValue: account.avatar },
    details: { stringValue: account.details },
    classGroup: { stringValue: account.classGroup }
  };
  if (account.subject) fields.subject = { stringValue: account.subject };
  if (account.room) fields.room = { stringValue: account.room };

  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/usuarios?key=${API_KEY}&documentId=${uid}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields })
  });
  const data = await res.json();
  if (!res.ok) {
    console.log(`  [firestore] ${account.email} -> ${JSON.stringify(data.error)}`);
    return;
  }
  console.log(`  perfil salvo no Firestore: ${data.name}`);
}

async function main() {
  for (const account of DEMO_ACCOUNTS) {
    console.log(`\nProcessando ${account.email} (${account.role}):`);
    const uid = await createAuthUser(account);
    if (!uid) continue;
    await seedFirestoreProfile(account, uid);
  }
}

main().catch((err) => {
  console.error('\nFalha no seed:', err.message);
  process.exit(1);
});