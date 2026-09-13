import { Subject, Task, ImageAssetInfo, UserProfile, DoubtItem, ActivitySubmission, TeacherActivity, VirtualRoomInfo, VirtualRoomParticipant, VirtualRoomMessage, RoomPoll, RoomMaterial, RoomLink } from '../types';

export const APP_IMAGES = {
  logo: 'https://lh3.googleusercontent.com/aida/AEtjO1Wi34eyHLFmWRVUzSqJ-Vn2XZsX-2VEFPFKSGJ4o14-ysnjcxsnYGLVmh7VEKpARTpgMF_xt7TxzJMlh69kDf6NyAxu5oyHCbHcYc-PgRZOdGPvuIzDeTIwIBMcyRcWZW_MNG3TcVy-uUCXl_mAhCxIWkSfmhB7qMdUcaGiKLXUFg6WcxfryCJfbFcF3KHHBZAyF6uIDVkjbGaIw14jKqWLHUd6l95j3-sp7bXgwVhkOhyLwohytS-aDat1',
  userProfile: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCd4dqPViCvKF6RRgQcBkydxlTMcLU74hD-tIDR99SIX5tCG0HI2EOtDTy6EpVUkDKNmvV_ri9_lFRQgpnL25hC9WKZANbEO0xs1YX0i8ztfPvz5FyTh-MgY4aI7WZXMeozIptetux8p_Rye4TOIk-BK-i73QuGSYD8hqOrIknJNzpv3Yh5OLv-ANN_5TBrcNWaqMlWErKosk_IhldmuzF3w7LeMQ0GLji7TlNdAuZWhECHCLPgzojoBw',
  teachers: {
    ricardoMendes: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZn0SmRgIYuAYnNCLXojqHz3tUOIMZXr2ElZutWN0_WmSmNHwgoupo_i9CI1DJjNc1rniEytzB0NdhjReNlTncbENP-RWufR2qImJhtt9LrqtapgrRe7yoJ_hGagpQnImq9wQtQW_PxxJxdFxI3jDK618zjI4iifKCx_vF9c-lme6wQ7qCPR3ClRA-t5vs2rpZQNI4JOAbnJqlD0sjHtRuVS-VwiZDhuMcY0Qhgx1c-Dowk6aRfWW-Tw',
    camilaDuarte: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAatHg5uexhoPtWazT0dwbAMRKOCPU1fRzU60z1B0v7tgrShCAnBUvQBOx18Am52PgOg7uhIr4v9h6Qc_cb1InVJVWHUkAM4ddD95xEXT2EAlh3fCseTM6pqXydUEmbsiZyCdTVNsn7mXOdzf6AZ6OE_LOEndpz4YxMZIH95UWirVSj61irbzkJ4u6-Ho194h6Wytp2X_3603bfTBQ-ztC7Sx8azvlUIFa04y7dQKLeEFAyT9pG8q9JOw',
    marcosVinicius: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqXUscbDglynC-7tXIIxxt-JlR7Tqn7FZjjU7jpwfEjFfkYs-9N83bsBNYVg4giGabmZ5BkK6mHfoVluzMJIOdFvbsSUU-74jXpWg2G29mswf_FzIeXZICmS1DYr380K0LSDkCJiSD9oN1VY0DW7jgrjGHC6hyAqUvfjWnTBHioNlUXQCgikgUjTtv5R5WbXoVwm7XyIgrltw_q2C51JDRN5ECN7IXy7VT4jrhZbQ5uv7JxIsM0WgJ2A',
    helenaSouza: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRNhXwB4pkQTdPVqfnw6UiAJz7rL_ofNWc1odcAevKc0GWqFCxXvuomoNv_zOjQG-DK5j-5uuo3ETQAMk32O5MUgy78QbPOZC4vP8kS_phZGZRdrLaOcjMPGUcT-xz3WS3bCfG7Rt5xg8a52upQ_M-Q5880wLI--LmV1mRs9IeloToflOfYciOap5hQiK1fApDyKVJyBjA59inEa0hEep2tbKXGL-Bvyd8KiUzZg2MgbyLD2aPTKz5LA',
    beatrizLima: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxhKkx7HWT3cP3vdNq_OTDd3ubtX0yF8b3JMdpI0XUGWaHmmG5xX0P1XWoAtdFLfSpr8hXQ_sqf2fxULwoHuk-gLx67e1xnOuHtifs0n2IVh04jibqevxaaFUqVCqlM5ZsT7TOmIW2oFOSLhrb79JtpZDkh59boOuZov9dq59zMX6eYdjQTW-TRYpTvxmyGfOMabEQtOkOMjU61fk97Yk1zkLdhQjy7gvM9IWd0p1LyMnB4kseK27Rlg'
  },
  peers: [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD4LfhqPY4TD2fo1ulfbon9D_viF6pDLLq4Lo9t4J3wvyt5SynHA9k84t_rXtBQo3AEF3_PuZpVh97TCauX_lKYkX5xHetdLnwX1PZhCLTff_aINF5yaWu89wQEXI5m6x3nFI2Qy__rmKGyhZdSc0dkyMjSpcoxxIn-4d_qFgPwMkP20wUmms4p1tkG9w0zpDFPSpw77STvP-NcWpUQWP32GjRuF5NclXTCZPiqjE-lsG7sl60fB2q0Ig',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBv096kTkzeHuZXiAl6K9QGWT_hkL8j37dsvMavAb5HtiC_TUV4jfUBSrg9JKHJGA22_fz9XYIqDtg8QtydVBtdwX9j1fUbebdN1xgssZ701iiGw7g3NgMghkK_XU0WuAfBV2Q27j0GZ0gBYZeaEnIaA7HaOu7GTX2KCMPrakiya8D7Hkx9BAAWIkj0gMT4TGLHn_QGsFyTcyLcRz4fMezz4aSUg4SlOEW_kBxkhUQpZ0qb5rpAsA6c8g',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBPzAKFTpOCSwLxi9Nx7_68ynDDfz1TbC0BCrnTu-2UqhEeE6n6nWu_9mBLWeNA8v-Vq18cTCCDPOtQv-GUEyHtaF_0uHg27QGGVX-r5PU51k94RzS4eoZtg45ZOpl0GjP1yH3jerQywY7qyAfTE2h-BOadwdvCp-RwPtUDCC2QIsSxSF3XZcfzxf0rM62njdr8J9QDrO73V9gUhCV98bIcE99Y2nD2l8P6Dv9oqhuisULS-tAcI11YCA'
  ]
};

export const DIRECT_IMAGE_ASSETS: ImageAssetInfo[] = [
  {
    id: 'img-logo',
    title: 'Ícone Oficial +Foco',
    description: 'Logomarca em alta definição com gradiente índigo/coral e anel de foco.',
    url: APP_IMAGES.logo,
    htmlSnippet: `<img src="${APP_IMAGES.logo}" alt="+Foco Logo" class="h-8 w-auto object-contain" />`,
    category: 'logo'
  },
  {
    id: 'img-profile',
    title: 'Avatar Estudante (Lucas)',
    description: 'Foto de perfil do estudante protagonista em ambiente escolar.',
    url: APP_IMAGES.userProfile,
    htmlSnippet: `<img src="${APP_IMAGES.userProfile}" alt="Profile Lucas" class="w-8 h-8 rounded-full object-cover" />`,
    category: 'perfil'
  },
  {
    id: 'img-prof-ricardo',
    title: 'Prof. Ricardo Mendes',
    description: 'Professor de Matemática e Geometria Espacial (3º Ano A).',
    url: APP_IMAGES.teachers.ricardoMendes,
    htmlSnippet: `<img src="${APP_IMAGES.teachers.ricardoMendes}" alt="Prof. Ricardo Mendes" class="w-6 h-6 rounded-full object-cover" />`,
    category: 'professores'
  },
  {
    id: 'img-prof-camila',
    title: 'Profª. Camila Duarte',
    description: 'Professora de Física Térmica e Ciências da Natureza.',
    url: APP_IMAGES.teachers.camilaDuarte,
    htmlSnippet: `<img src="${APP_IMAGES.teachers.camilaDuarte}" alt="Profª. Camila Duarte" class="w-6 h-6 rounded-full object-cover" />`,
    category: 'professores'
  },
  {
    id: 'img-prof-marcos',
    title: 'Prof. Marcos Vinícius',
    description: 'Professor de História do Brasil e Ciências Humanas.',
    url: APP_IMAGES.teachers.marcosVinicius,
    htmlSnippet: `<img src="${APP_IMAGES.teachers.marcosVinicius}" alt="Prof. Marcos Vinícius" class="w-6 h-6 rounded-full object-cover" />`,
    category: 'professores'
  },
  {
    id: 'img-prof-helena',
    title: 'Profª. Helena Souza',
    description: 'Professora de Biologia e Genética Molecular.',
    url: APP_IMAGES.teachers.helenaSouza,
    htmlSnippet: `<img src="${APP_IMAGES.teachers.helenaSouza}" alt="Profª. Helena Souza" class="w-6 h-6 rounded-full object-cover" />`,
    category: 'professores'
  },
  {
    id: 'img-prof-beatriz',
    title: 'Profª. Beatriz Lima',
    description: 'Professora de Língua Portuguesa e Literatura Moderna.',
    url: APP_IMAGES.teachers.beatrizLima,
    htmlSnippet: `<img src="${APP_IMAGES.teachers.beatrizLima}" alt="Profª. Beatriz Lima" class="w-6 h-6 rounded-full object-cover" />`,
    category: 'professores'
  },
  {
    id: 'img-peer-1',
    title: 'Colega de Foco (Mariana)',
    description: 'Avatar participante da sessão de co-estudo ao vivo.',
    url: APP_IMAGES.peers[0],
    htmlSnippet: `<img src="${APP_IMAGES.peers[0]}" alt="Colega Mariana" class="h-5 w-5 rounded-full" />`,
    category: 'colegas'
  },
  {
    id: 'img-peer-2',
    title: 'Colega de Foco (Guilherme)',
    description: 'Avatar participante da sessão de co-estudo ao vivo.',
    url: APP_IMAGES.peers[1],
    htmlSnippet: `<img src="${APP_IMAGES.peers[1]}" alt="Colega Guilherme" class="h-5 w-5 rounded-full" />`,
    category: 'colegas'
  },
  {
    id: 'img-peer-3',
    title: 'Colega de Foco (Clara)',
    description: 'Avatar participante da sessão de co-estudo ao vivo.',
    url: APP_IMAGES.peers[2],
    htmlSnippet: `<img src="${APP_IMAGES.peers[2]}" alt="Colega Clara" class="h-5 w-5 rounded-full" />`,
    category: 'colegas'
  }
];

export const SUBJECTS_DATA: Subject[] = [
  {
    id: 'matematica',
    name: 'Matemática',
    category: 'Exatas',
    categoryColor: '#3a34d3',
    teacher: {
      name: 'Prof. Ricardo Mendes',
      avatar: APP_IMAGES.teachers.ricardoMendes
    },
    room: 'Sala 04-B',
    schedule: 'Ao vivo agora',
    isLiveNow: true,
    liveBadgeText: 'Ao vivo agora',
    pendingTask: {
      title: 'Desafio de Probabilidade',
      deadline: 'Entrega hoje até 23:59',
      urgent: true,
      type: 'Urgente'
    },
    progress: 75,
    progressLabel: '75% concluído',
    iconName: 'calculate',
    themeColor: '#3a34d3'
  },
  {
    id: 'fisica',
    name: 'Física',
    category: 'Ciências da Natureza',
    categoryColor: '#464555',
    teacher: {
      name: 'Profª. Camila Duarte',
      avatar: APP_IMAGES.teachers.camilaDuarte
    },
    room: 'Laboratório 2',
    schedule: 'Hoje às 10:45',
    isLiveNow: false,
    statusBadge: 'Hoje às 10:45',
    pendingTask: {
      title: '1 atividade de laboratório pendente',
      deadline: 'Próxima aula',
      urgent: false
    },
    progress: 60,
    progressLabel: '60%',
    iconName: 'offline_bolt',
    themeColor: '#5452ec'
  },
  {
    id: 'historia',
    name: 'História',
    category: 'Humanas',
    categoryColor: '#b22200',
    teacher: {
      name: 'Prof. Marcos Vinícius',
      avatar: APP_IMAGES.teachers.marcosVinicius
    },
    room: 'Sala 12',
    schedule: 'Amanhã, 08:00',
    isLiveNow: false,
    statusBadge: 'Amanhã, 08:00',
    activeDiscussion: 'Discussão ativa: "Revolução Industrial"',
    progress: 90,
    progressLabel: '90% Excelente',
    iconName: 'history_edu',
    themeColor: '#b22200'
  },
  {
    id: 'biologia',
    name: 'Biologia',
    category: 'Biológicas',
    categoryColor: '#005d3e',
    teacher: {
      name: 'Profª. Helena Souza',
      avatar: APP_IMAGES.teachers.helenaSouza
    },
    room: 'Laboratório 1',
    schedule: 'Quinta-feira',
    isLiveNow: false,
    statusBadge: 'Quinta-feira',
    groupProject: 'Projeto de Genética (Em grupo) • Você + 3 colegas de turma',
    progress: 45,
    progressLabel: '45%',
    iconName: 'psychology_alt',
    themeColor: '#005d3e'
  },
  {
    id: 'portugues',
    name: 'Língua Portuguesa',
    category: 'Linguagens',
    categoryColor: '#d73b19',
    teacher: {
      name: 'Profª. Beatriz Lima',
      avatar: APP_IMAGES.teachers.beatrizLima
    },
    room: 'Sala 03',
    schedule: 'Sexta-feira',
    isLiveNow: false,
    statusBadge: 'Sexta-feira',
    recommendedReading: {
      title: 'Leitura recomendada: Modernismo Brasileiro',
      format: 'PDF'
    },
    progress: 82,
    progressLabel: '82%',
    iconName: 'translate',
    themeColor: '#d73b19'
  }
];

export const TASKS_DATA: Task[] = [
  {
    id: 'task-1',
    subject: 'Física Térmica',
    title: 'Desafio das Leis dos Gases',
    tag: 'Interativa',
    tagType: 'primary',
    deadline: 'Hoje até 14:30',
    detail: '3 questões rápidas',
    progressPercent: 33,
    type: 'quiz'
  },
  {
    id: 'task-2',
    subject: 'História do Brasil',
    title: 'Debate: Política do Café com Leite',
    tag: 'Áudio / Criar',
    tagType: 'secondary',
    deadline: 'Amanhã • 08:00',
    detail: 'Gravar áudio reflexivo de 1 min sobre os acordos de alternância de poder de MG e SP.',
    type: 'audio'
  },
  {
    id: 'task-3',
    subject: 'Matemática',
    title: 'Lista de Prismas e Poliedros Regulares',
    tag: 'Exercícios',
    tagType: 'neutral',
    deadline: 'Quinta • 18:00',
    detail: 'Resolver os exercícios ímpares da página 45 do livro.',
    progressPercent: 60,
    type: 'text'
  }
];

export const DEFAULT_USERS: { students: UserProfile[]; teachers: UserProfile[] } = {
  students: [
    {
      id: 'aluno-lucas',
      role: 'aluno',
      name: 'Lucas Andrade',
      avatar: APP_IMAGES.userProfile,
      details: 'Matrícula: 2024-8841 • Foco em Exatas & Vestibular',
      classGroup: '3º Ano A',
      email: 'lucas.andrade@escola.edu.br'
    },
    {
      id: 'aluno-mariana',
      role: 'aluno',
      name: 'Mariana Duarte',
      avatar: APP_IMAGES.peers[0],
      details: 'Matrícula: 2024-8842 • Líder de Turma',
      classGroup: '3º Ano A',
      email: 'mariana.duarte@escola.edu.br'
    }
  ],
  teachers: [
    {
      id: 'prof-ricardo',
      role: 'professor',
      name: 'Prof. Ricardo Mendes',
      avatar: APP_IMAGES.teachers.ricardoMendes,
      details: 'Matemática & Geometria Espacial • Sala 04-B',
      subject: 'Matemática',
      room: 'Sala 04-B',
      classGroup: '3º Ano A',
      email: 'ricardo.mendes@escola.edu.br'
    },
    {
      id: 'prof-camila',
      role: 'professor',
      name: 'Profª. Camila Duarte',
      avatar: APP_IMAGES.teachers.camilaDuarte,
      details: 'Física Térmica & Mecânica • Laboratório 2',
      subject: 'Física',
      room: 'Laboratório 2',
      classGroup: '3º Ano A',
      email: 'camila.duarte@escola.edu.br'
    },
    {
      id: 'prof-marcos',
      role: 'professor',
      name: 'Prof. Marcos Vinícius',
      avatar: APP_IMAGES.teachers.marcosVinicius,
      details: 'História do Brasil & Contemporânea • Sala 12',
      subject: 'História',
      room: 'Sala 12',
      classGroup: '3º Ano A',
      email: 'marcos.souza@escola.edu.br'
    }
  ]
};

export const INITIAL_DOUBTS: DoubtItem[] = [
  {
    id: 'doubt-1',
    studentName: 'Lucas Andrade',
    studentAvatar: APP_IMAGES.userProfile,
    table: 'Mesa 04',
    subject: 'Matemática',
    topic: 'Cálculo de Volume - Prisma Reto',
    question: 'Professor, quando o cilindro está inclinado, usamos a altura vertical ou a geratriz oblíqua?',
    time: 'Há 2 min',
    status: 'pendente'
  },
  {
    id: 'doubt-2',
    studentName: 'Guilherme Castro',
    studentAvatar: APP_IMAGES.peers[1],
    table: 'Mesa 02',
    subject: 'Matemática',
    topic: 'Conversão de Unidades',
    question: 'Como faço para passar cm³ para litros no item c da página 42?',
    time: 'Há 6 min',
    status: 'em_atendimento'
  },
  {
    id: 'doubt-3',
    studentName: 'Clara Nogueira',
    studentAvatar: APP_IMAGES.peers[2],
    table: 'Mesa 07',
    subject: 'Matemática',
    topic: 'Área da Base',
    question: 'Dúvida tirada: base hexagonal regular dividida em 6 triângulos equiláteros.',
    time: 'Há 14 min',
    status: 'resolvido'
  }
];

export const INITIAL_SUBMISSIONS: ActivitySubmission[] = [
  {
    id: 'sub-1',
    studentName: 'Lucas Andrade',
    pairName: 'Mariana Duarte',
    subject: 'Matemática',
    activityTitle: 'Cálculo de Volume (Pág. 42)',
    answer: '471.24 cm³',
    stepWork: 'V = π · r² · h = 3.14159 · 5² · 6 = 3.14159 · 25 · 6 = 471.24 cm³',
    status: 'pendente',
    submittedAt: '10:14'
  },
  {
    id: 'sub-2',
    studentName: 'Clara Nogueira',
    pairName: 'Enzo Ramos',
    subject: 'Matemática',
    activityTitle: 'Cálculo de Volume (Pág. 42)',
    answer: '471.2 cm³',
    stepWork: 'V = π · 25 · 6 = 150π ≈ 471.24 cm³',
    status: 'aprovado',
    feedback: 'Excelente trabalho em dupla! Resolução clara e precisa.',
    submittedAt: '10:08'
  }
];

export const CLASS_FEED = [
  {
    id: 'post-1',
    author: 'Prof. Ricardo Mendes',
    avatar: APP_IMAGES.teachers.ricardoMendes,
    role: 'Professor • Matemática',
    time: 'Há 25 minutos',
    content: 'Pessoal, adicionei a demonstração visual do cálculo de volume dos prismas na aba Materiais da sala. Confiram antes da atividade!',
    badge: 'Aviso Oficial'
  },
  {
    id: 'post-2',
    author: 'Mariana Duarte',
    avatar: APP_IMAGES.peers[0],
    role: 'Colega de Turma',
    time: 'Há 1 hora',
    content: 'Alguém mais com dúvida na questão 2 de física sobre transformação isobárica? Podemos estudar juntos na biblioteca virtual.',
    badge: 'Grupo de Estudo'
  },
  {
    id: 'post-3',
    author: 'Coordenação Pedagógica',
    avatar: APP_IMAGES.logo,
    role: 'Escola Modelo',
    time: 'Hoje cedo',
    content: 'Parabéns ao 3º Ano A! A turma atingiu 88% de constância semanal no modo foco ativo. Mantenham o ritmo!',
    badge: 'Conquista Coletiva'
  }
];

export const INITIAL_TEACHER_ACTIVITIES: TeacherActivity[] = [
  {
    id: 'act-1',
    title: 'Cálculo de Volume: Prismas e Cilindros Oblíquos',
    subject: 'Matemática',
    teacherName: 'Prof. Ricardo Mendes',
    classGroup: '3º Ano A',
    description: 'Resolver os 4 problemas práticos da página 42. Incluir a fórmula desenvolvida passo a passo e o cálculo aproximado com π ≈ 3.14.',
    deadline: 'Hoje, 10:45',
    points: 100,
    mode: 'dupla',
    createdAt: 'Hoje cedo',
    status: 'em_andamento',
    attachments: [
      {
        id: 'att-1',
        type: 'pdf',
        title: 'Apostila_Prismas_Cilindros_Resolucao.pdf',
        fileSize: '3.4 MB',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
      },
      {
        id: 'att-2',
        type: 'image',
        title: 'Diagrama_Secao_Transversal_Prisma.png',
        fileSize: '820 KB',
        url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
        previewUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80'
      },
      {
        id: 'att-3',
        type: 'link',
        title: 'GeoGebra 3D — Modelador Interativo de Cilindros',
        url: 'https://www.geogebra.org/3d'
      }
    ]
  },
  {
    id: 'act-2',
    title: 'Mapa Mental: Transformações Gasosas & 1ª Lei',
    subject: 'Física',
    teacherName: 'Profª. Camila Duarte',
    classGroup: '3º Ano A',
    description: 'Construir síntese visual com as curvas isotérmica, isobárica e isométrica.',
    deadline: 'Amanhã, 14:00',
    points: 80,
    mode: 'individual',
    createdAt: 'Ontem',
    status: 'aberta',
    attachments: [
      {
        id: 'att-4',
        type: 'pdf',
        title: 'Roteiro_Termodinamica_Aplicada.pdf',
        fileSize: '2.1 MB',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
      },
      {
        id: 'att-5',
        type: 'link',
        title: 'Simulador Interativo PhET — Gases Ideais',
        url: 'https://phet.colorado.edu/pt_BR/simulations/gas-properties'
      }
    ]
  }
];

export const INITIAL_VIRTUAL_ROOMS: VirtualRoomInfo[] = [
  {
    id: 'room-mat-3a',
    subject: 'Matemática',
    teacherName: 'Prof. Ricardo Mendes',
    teacherAvatar: APP_IMAGES.teachers.ricardoMendes,
    roomName: 'Sala 04-B Virtual • 3º Ano A',
    accessCode: 'FOCO-3A-MAT',
    nativeLink: 'https://foco.app/sala/FOCO-3A-MAT',
    isActive: true,
    platform: 'foco_live',
    startedAt: '10:00',
    topicDescription: 'Aula Prática: Demonstração e Resolução de Geometria Espacial (Prismas e Cilindros)',
    presentationMode: 'lousa',
    activeSlide: 1
  },
  {
    id: 'room-fis-3a',
    subject: 'Física',
    teacherName: 'Profª. Camila Duarte',
    teacherAvatar: APP_IMAGES.teachers.camilaDuarte,
    roomName: 'Laboratório Virtual de Termodinâmica',
    accessCode: 'FIS-3A-LAB',
    nativeLink: 'https://foco.app/sala/FIS-3A-LAB',
    isActive: false,
    platform: 'foco_live',
    topicDescription: 'Plantão de Dúvidas sobre Transformações Gasosas',
    presentationMode: 'slides',
    activeSlide: 1
  }
];

export const INITIAL_ROOM_PARTICIPANTS: VirtualRoomParticipant[] = [
  {
    id: 'teacher-1',
    name: 'Prof. Ricardo Mendes',
    avatar: APP_IMAGES.teachers.ricardoMendes,
    role: 'professor',
    desk: 'Mesa do Professor',
    isMuted: false,
    isVideoOn: true,
    handRaised: false
  },
  {
    id: 'student-lucas',
    name: 'Lucas Santos (Você)',
    avatar: APP_IMAGES.userProfile,
    role: 'aluno',
    desk: 'Mesa 04',
    isMuted: true,
    isVideoOn: true,
    handRaised: false
  },
  {
    id: 'student-mariana',
    name: 'Mariana Duarte',
    avatar: APP_IMAGES.peers[0],
    role: 'aluno',
    desk: 'Mesa 04 (Sua Dupla)',
    isMuted: true,
    isVideoOn: false,
    handRaised: false,
    reaction: '👍'
  },
  {
    id: 'student-enzo',
    name: 'Enzo Ramos',
    avatar: APP_IMAGES.peers[1],
    role: 'aluno',
    desk: 'Mesa 01',
    isMuted: true,
    isVideoOn: true,
    handRaised: true
  },
  {
    id: 'student-clara',
    name: 'Clara Silva',
    avatar: APP_IMAGES.peers[2],
    role: 'aluno',
    desk: 'Mesa 01',
    isMuted: true,
    isVideoOn: true,
    handRaised: false
  }
];

export const INITIAL_ROOM_MESSAGES: VirtualRoomMessage[] = [
  {
    id: 'msg-1',
    senderName: 'Prof. Ricardo Mendes',
    senderAvatar: APP_IMAGES.teachers.ricardoMendes,
    senderRole: 'professor',
    text: 'Bom dia turma! Iniciamos a transmissão nativa da resolução de Geometria Espacial. Podem abrir o material da página 42!',
    time: '10:02'
  },
  {
    id: 'msg-2',
    senderName: 'Mariana Duarte',
    senderAvatar: APP_IMAGES.peers[0],
    senderRole: 'aluno',
    text: 'Professor, o slide do cilindro oblíquo está muito nítido aqui no celular!',
    time: '10:04'
  },
  {
    id: 'msg-3',
    senderName: 'Enzo Ramos',
    senderAvatar: APP_IMAGES.peers[1],
    senderRole: 'aluno',
    text: 'Levantei a mão para tirar uma dúvida sobre a altura inclinada vs altura real.',
    time: '10:05'
  }
];

export const INITIAL_ROOM_POLLS: RoomPoll[] = [
  {
    id: 'poll-1',
    question: 'Cilindro oblíquo: na hora de calcular o volume, qual altura você usaria?',
    options: [
      { id: 'poll-1-a', label: 'A altura perpendicular (reta)', votes: 18 },
      { id: 'poll-1-b', label: 'A geratriz inclinada', votes: 5 },
      { id: 'poll-1-c', label: 'A média entre as duas', votes: 2 }
    ],
    isOpen: true,
    createdAt: 'Hoje, 10:18',
    createdBy: 'Prof. Ricardo Mendes'
  },
  {
    id: 'poll-2',
    question: 'Qual dificuldade mais bateu na lista de Prismas?',
    options: [
      { id: 'poll-2-a', label: 'Cálculo da área da base', votes: 7 },
      { id: 'poll-2-b', label: 'Conversão de unidades (cm³ → L)', votes: 11 },
      { id: 'poll-2-c', label: 'Modelar o sólido no GeoGebra', votes: 4 }
    ],
    isOpen: false,
    createdAt: 'Hoje, 09:40',
    createdBy: 'Prof. Ricardo Mendes'
  }
];

export const INITIAL_ROOM_MATERIALS: RoomMaterial[] = [
  {
    id: 'rm-1',
    type: 'pdf',
    title: 'Apostila_Prismas_Cilindros_Resolucao.pdf',
    description: 'Resolução passo a passo da página 42, com π ≈ 3,14 e unidades convertidas.',
    fileSize: '3.4 MB',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: 'rm-2',
    type: 'image',
    title: 'Diagrama_Secao_Transversal_Prisma.png',
    description: 'Corte transversal do prisma hexagonal com a fórmula da área da base.',
    fileSize: '820 KB',
    url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
    previewUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'rm-3',
    type: 'slides',
    title: 'Síntese de Aula — Geometria Espacial',
    description: 'Slides 1 a 4 da sessão: princípio de Cavalieri, prismas retos vs oblíquos.',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: 'rm-4',
    type: 'pdf',
    title: 'Lista_Prismas_Poliedros_Regulares.pdf',
    description: 'Exercícios ímpares da página 45 para entrega até quinta-feira.',
    fileSize: '1.1 MB',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  }
];

export const INITIAL_ROOM_LINKS: RoomLink[] = [
  {
    id: 'link-1',
    title: 'GeoGebra 3D — Cilindros & Prismas',
    description: 'Modelador interativo para testar o cálculo de volumes em tempo real.',
    url: 'https://www.geogebra.org/3d',
    icon: 'draw',
    tag: 'Simulador'
  },
  {
    id: 'link-2',
    title: 'PhET — Propriedades dos Gases',
    description: 'Simulador de gases ideais (referência do plantão de Física).',
    url: 'https://phet.colorado.edu/pt_BR/simulations/gas-properties',
    icon: 'science',
    tag: 'Física'
  },
  {
    id: 'link-3',
    title: 'Apostila Oficial Bimestral — PDF',
    description: 'Material oficial com teoria completa e exercícios comentados.',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    icon: 'menu_book',
    tag: 'Material'
  },
  {
    id: 'link-4',
    title: 'Portal do Aluno — Escola Modelo',
    description: 'Notas, frequência, comunicados e biblioteca virtual.',
    url: 'https://escola-modelo.edu.br/aluno',
    icon: 'school',
    tag: 'Institucional'
  }
];

