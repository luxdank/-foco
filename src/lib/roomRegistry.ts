import { useCallback, useEffect, useRef, useState } from 'react';
import {
  collection,
  doc as fsDoc,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { VirtualRoomInfo } from '../types';
import { INITIAL_VIRTUAL_ROOMS } from '../data/mockData';
import { getDb } from '../firebase';
import { SyncStatus } from './useSyncedCollection';

const STORAGE_KEY = 'foco-rooms';
const BUS_NAME = 'foco-bus-rooms';
const SEED_LOCK_PREFIX = 'foco-seed-rooms';

function toDoc(r: VirtualRoomInfo) {
  return {
    subject: r.subject,
    teacherName: r.teacherName,
    teacherAvatar: r.teacherAvatar || '',
    roomName: r.roomName,
    accessCode: r.accessCode,
    nativeLink: r.nativeLink,
    isActive: !!r.isActive,
    platform: r.platform,
    startedAt: r.startedAt || '',
    topicDescription: r.topicDescription || '',
    presentationMode: r.presentationMode || 'lousa',
    activeSlide: r.activeSlide ?? 1
  };
}

function fromDoc(id: string, d: Record<string, unknown>): VirtualRoomInfo {
  return {
    id,
    subject: (d.subject as string) || 'Matemática',
    teacherName: (d.teacherName as string) || 'Professor',
    teacherAvatar: (d.teacherAvatar as string) || undefined,
    roomName: (d.roomName as string) || 'Sala Virtual',
    accessCode: (d.accessCode as string) || '',
    nativeLink: (d.nativeLink as string) || `https://foco.app/sala/${(d.accessCode as string) || id}`,
    isActive: !!d.isActive,
    platform: (d.platform as VirtualRoomInfo['platform']) || 'foco_live',
    startedAt: (d.startedAt as string) || undefined,
    topicDescription: (d.topicDescription as string) || undefined,
    presentationMode: (d.presentationMode as VirtualRoomInfo['presentationMode']) || 'lousa',
    activeSlide: (d.activeSlide as number) ?? 1
  };
}

function sortRooms(list: VirtualRoomInfo[]) {
  return list
    .slice()
    .sort(
      (a, b) =>
        Number(b.isActive) - Number(a.isActive) ||
        a.accessCode.localeCompare(b.accessCode) ||
        a.id.localeCompare(b.id)
    );
}

function readLocal(): VirtualRoomInfo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: VirtualRoomInfo[] | null = raw ? JSON.parse(raw) : null;
    return sortRooms(
      parsed && Array.isArray(parsed) && parsed.length ? parsed : INITIAL_VIRTUAL_ROOMS
    );
  } catch {
    return sortRooms(INITIAL_VIRTUAL_ROOMS);
  }
}

function writeLocal(next: VirtualRoomInfo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

/**
 * Registro de salas virtuais criadas/ajustadas pelo professor, sincronizado em
 * tempo real via Firestore (coleção de topo `salasVirtuals`, doc id = room.id),
 * com fallback local (localStorage + BroadcastChannel). É este registro que
 * liga a requisição do código digitado pelo aluno às salas do professor.
 */
export function useRoomRegistry() {
  const [rooms, setRooms] = useState<VirtualRoomInfo[]>(() => readLocal());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('conectando');

  const unsubRef = useRef<(() => void) | null>(null);
  const busRef = useRef<BroadcastChannel | null>(null);

  const registryColl = () => collection(getDb(), 'salasVirtuals');

  useEffect(() => {
    let cancelled = false;

    const startLocal = () => {
      if (cancelled) return;
      setRooms(readLocal());
      setSyncStatus('local');

      if (typeof BroadcastChannel !== 'undefined') {
        const bus = new BroadcastChannel(BUS_NAME);
        bus.onmessage = (event) => {
          const data = event.data as { type?: string; items?: VirtualRoomInfo[] };
          if (data && data.type === 'full' && Array.isArray(data.items)) {
            setRooms(sortRooms(data.items));
          }
        };
        busRef.current = bus;
      }
    };

    const seedIfEmpty = (size: number) => {
      if (size > 0 || cancelled) return;
      const lock = `${SEED_LOCK_PREFIX}${STORAGE_KEY}`;
      if (localStorage.getItem(lock)) return;
      localStorage.setItem(lock, String(Date.now()));

      INITIAL_VIRTUAL_ROOMS.forEach((room) => {
        setDoc(fsDoc(registryColl(), room.id), {
          ...toDoc(room),
          createdAt: serverTimestamp()
        }).catch(() => {});
      });

      window.setTimeout(() => localStorage.removeItem(lock), 60_000);
    };

    try {
      const q = query(registryColl(), limit(500));
      unsubRef.current = onSnapshot(
        q,
        (snap) => {
          if (cancelled) return;
          setSyncStatus('online');
          if (snap.size === 0) {
            // Sem documentos ainda: mantém as salas locais de exemplo enquanto o
            // seed é gravado, evitando estado vazio que quebraria a UI.
            seedIfEmpty(snap.size);
            return;
          }
          setRooms(
            sortRooms(
              snap.docs.map((doc) => fromDoc(doc.id, doc.data() as Record<string, unknown>))
            )
          );
          seedIfEmpty(snap.size);
        },
        (err) => {
          console.warn('[rooms] Firestore indisponível, usando modo local.', err);
          startLocal();
        }
      );
    } catch (e) {
      console.warn('[rooms] Falha ao iniciar, usando modo local.', e);
      startLocal();
    }

    return () => {
      cancelled = true;
      unsubRef.current?.();
      unsubRef.current = null;
      busRef.current?.close();
      busRef.current = null;
    };
  }, []);

  const broadcast = useCallback((next: VirtualRoomInfo[]) => {
    busRef.current?.postMessage({ type: 'full', items: next });
  }, []);

  const saveRoom = useCallback(
    (room: VirtualRoomInfo) => {
      const payload = toDoc(room);

      if (syncStatus === 'online') {
        setDoc(fsDoc(registryColl(), room.id), payload, { merge: true }).catch((err) => {
          console.warn('[rooms] Falha ao salvar via Firestore, salvando local.', err);
          setSyncStatus('local');
          const next = readLocal().filter((r) => r.id !== room.id);
          next.push(room);
          writeLocal(sortRooms(next));
          setRooms(sortRooms(next));
          broadcast(sortRooms(next));
        });
        return;
      }

      const next = readLocal().filter((r) => r.id !== room.id);
      next.push(room);
      writeLocal(sortRooms(next));
      setRooms(sortRooms(next));
      broadcast(sortRooms(next));
    },
    [syncStatus, broadcast]
  );

  return { rooms, syncStatus, saveRoom };
}