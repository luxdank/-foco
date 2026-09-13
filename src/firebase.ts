import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth, browserLocalPersistence, setPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBYyNbB_47_1SX1Kp0BsEOyYfv0Zbd7lec',
  authDomain: 'videira-coffe.firebaseapp.com',
  projectId: 'videira-coffe',
  storageBucket: 'videira-coffe.firebasestorage.app',
  messagingSenderId: '19294362012',
  appId: '1:19294362012:web:bc83eaa9b1c4b44bd05059'
};

// Banco nomeado criado para o applet FOCO no console do Firebase.
// Se você tiver criado o banco como "default", troque por ''.
const FIRESTORE_DATABASE_ID = '';

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let authPromise: Promise<Auth> | null = null;

function getApp(): FirebaseApp {
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

export function getDb(): Firestore {
  if (!db) {
    db = getFirestore(getApp(), FIRESTORE_DATABASE_ID);
  }
  return db;
}

export function initAuth(): Promise<Auth> {
  if (!authPromise) {
    const auth = getAuth(getApp());
    authPromise = setPersistence(auth, browserLocalPersistence).then(() => auth);
  }
  return authPromise;
}