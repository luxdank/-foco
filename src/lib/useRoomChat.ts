import { useCallback, useEffect, useRef, useState } from 'react';
import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { UserProfile, VirtualRoomMessage } from '../types';
import { INITIAL_ROOM_MESSAGES } from '../data/mockData';
import { getDb } from '../firebase';

export type ChatStatus = 'conectando' | 'online' | 'local';

const MESSAGES_LIMIT = 300;
const LOCAL_CHAT_PREFIX = 'foco-chat-';
const SEED_LOCK_PREFIX = 'foco-seed-';

interface ChatDocData {
  senderUserId?: string;
  senderName: string;
  senderAvatar: string;
  senderRole: 'aluno' | 'professor';
  text: string;
  time: string;
  isPrivateToTeacher?: boolean;
  createdAt?: Timestamp;
}

function msgCollection(roomKey: string) {
  return collection(getDb(), 'salasVirtuals', roomKey, 'mensagens');
}

function localKey(roomKey: string) {
  return `${LOCAL_CHAT_PREFIX}${roomKey}`;
}

function readLocal(roomKey: string): VirtualRoomMessage[] {
  try {
    const raw = localStorage.getItem(localKey(roomKey));
    const parsed: VirtualRoomMessage[] | null = raw ? JSON.parse(raw) : null;
    return parsed && Array.isArray(parsed) && parsed.length ? parsed : INITIAL_ROOM_MESSAGES;
  } catch {
    return INITIAL_ROOM_MESSAGES;
  }
}

function writeLocal(roomKey: string, messages: VirtualRoomMessage[]) {
  localStorage.setItem(localKey(roomKey), JSON.stringify(messages));
}

export function useRoomChat(
  roomKey: string,
  currentUser: UserProfile,
  onPrivateDoubtToTeacher?: (topic: string, question: string) => void
) {
  const [messages, setMessages] = useState<VirtualRoomMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>('conectando');

  const unsubRef = useRef<(() => void) | null>(null);
  const busRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Fallback 100% local: sincroniza abas do mesmo navegador (BroadcastChannel + localStorage)
    const startLocal = () => {
      if (cancelled) return;
      setMessages(readLocal(roomKey));
      setStatus('local');

      if (typeof BroadcastChannel !== 'undefined') {
        const bus = new BroadcastChannel(`foco-bus-${roomKey}`);
        bus.onmessage = (event) => {
          const incoming = event.data as VirtualRoomMessage;
          if (!incoming || !incoming.id) return;
          setMessages((prev) => [...prev.filter((m) => m.id !== incoming.id), incoming]);
        };
        busRef.current = bus;
      }
    };

    // Semeia as mensagens iniciais apenas uma vez (quando o chat ainda está vazio)
    const seedIfEmpty = (size: number) => {
      if (size > 0 || cancelled) return;
      const lock = `${SEED_LOCK_PREFIX}${roomKey}`;
      if (localStorage.getItem(lock)) return;
      localStorage.setItem(lock, String(Date.now()));

      INITIAL_ROOM_MESSAGES.forEach((seed) => {
        addDoc(msgCollection(roomKey), {
          senderName: seed.senderName,
          senderAvatar: seed.senderAvatar,
          senderRole: seed.senderRole,
          text: seed.text,
          time: seed.time,
          isPrivateToTeacher: seed.isPrivateToTeacher || false,
          createdAt: serverTimestamp()
        }).catch(() => {});
      });

      window.setTimeout(() => localStorage.removeItem(lock), 60_000);
    };

    try {
      const q = query(msgCollection(roomKey), orderBy('createdAt', 'asc'), limit(MESSAGES_LIMIT));
      unsubRef.current = onSnapshot(
        q,
        (snap) => {
          if (cancelled) return;
          setStatus('online');
          const docs: VirtualRoomMessage[] = snap.docs.map((doc) => {
            const d = doc.data() as ChatDocData;
            return {
              id: doc.id,
              senderUserId: d.senderUserId,
              senderName: d.senderName,
              senderAvatar: d.senderAvatar,
              senderRole: d.senderRole,
              text: d.text,
              time: d.time,
              isPrivateToTeacher: d.isPrivateToTeacher || false
            };
          });
          setMessages(docs);
          seedIfEmpty(snap.size);
        },
        (err) => {
          console.warn('[chat] Firestore indisponível, usando modo local.', err);
          startLocal();
        }
      );
    } catch (e) {
      console.warn('[chat] Falha ao iniciar Firestore, usando modo local.', e);
      startLocal();
    }

    return () => {
      cancelled = true;
      unsubRef.current?.();
      unsubRef.current = null;
      busRef.current?.close();
      busRef.current = null;
    };
  }, [roomKey]);

  const appendLocal = useCallback(
    (msg: VirtualRoomMessage) => {
      setMessages((prev) => [...prev.filter((m) => m.id !== msg.id), msg]);
      const current = readLocal(roomKey);
      writeLocal(roomKey, [...current.filter((m) => m.id !== msg.id), msg]);
      busRef.current?.postMessage(msg);
    },
    [roomKey]
  );

  const send = useCallback(
    (
      text: string,
      isPrivateDoubt: boolean,
      override?: Partial<ChatDocData>
    ) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const base: ChatDocData = {
        ...(override || {}),
        senderUserId: override?.senderUserId || currentUser.id,
        senderName: override?.senderName || currentUser.name,
        senderAvatar: override?.senderAvatar || currentUser.avatar,
        senderRole: override?.senderRole || currentUser.role,
        isPrivateToTeacher: isPrivateDoubt,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        text: trimmed
      };

      if (isPrivateDoubt && onPrivateDoubtToTeacher) {
        onPrivateDoubtToTeacher('Sala Virtual', trimmed);
      }

      const localMsg = {
        id: `msg-${Date.now()}`,
        ...base,
        text: trimmed,
        isPrivateToTeacher: isPrivateDoubt
      } as VirtualRoomMessage;

      if (status === 'online') {
        addDoc(msgCollection(roomKey), { ...base, text: trimmed, createdAt: serverTimestamp() }).catch(
          (err) => {
            console.warn('[chat] Falha ao enviar via Firestore, salvando local.', err);
            setStatus('local');
            appendLocal(localMsg);
          }
        );
        return;
      }

      appendLocal(localMsg);
    },
    [roomKey, currentUser, status, onPrivateDoubtToTeacher, appendLocal]
  );

  const sendSystemNotice = useCallback(
    (text: string) => {
      send(text, false, {
        senderName: 'Sistema +Foco',
        senderAvatar: '',
        senderRole: 'aluno'
      });
    },
    [send]
  );

  return { messages, send, sendSystemNotice, status };
}