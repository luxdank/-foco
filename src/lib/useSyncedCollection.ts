import { useCallback, useEffect, useRef, useState } from 'react';
import {
  collection,
  doc as fsDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { getDb } from '../firebase';

export type SyncStatus = 'conectando' | 'online' | 'local';

export interface SyncedCollectionOptions<T> {
  roomKey: string;
  collectionName: string;
  seed: T[];
  toDoc: (item: T) => Record<string, unknown>;
  fromDoc: (docId: string, data: Record<string, unknown>) => T;
  keyOf: (item: T) => string;
}

function readLocal<T>(storageKey: string, seed: T[]): T[] {
  try {
    const raw = localStorage.getItem(storageKey);
    const parsed: T[] | null = raw ? JSON.parse(raw) : null;
    return parsed && Array.isArray(parsed) && parsed.length ? parsed : seed;
  } catch {
    return seed;
  }
}

function writeLocal<T>(storageKey: string, next: T[]) {
  localStorage.setItem(storageKey, JSON.stringify(next));
}

/**
 * Coleção sincronizada em tempo real do Firestore (sub-coleção de uma sala),
 * com fallback local automático (localStorage + BroadcastChannel) quando o
 * Firebase estiver indisponível. Os documentos usam o próprio `keyOf(item)`
 * como id, mantendo identidade estável entre sessões e dispositivos.
 */
export function useSyncedCollection<T>(options: SyncedCollectionOptions<T>) {
  const { roomKey, collectionName, seed, toDoc, fromDoc, keyOf } = options;

  const [items, setItems] = useState<T[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('conectando');

  const unsubRef = useRef<(() => void) | null>(null);
  const busRef = useRef<BroadcastChannel | null>(null);

  const storageKey = `foco-${collectionName}-${roomKey}`;
  const busName = `foco-bus-${collectionName}-${roomKey}`;

  const broadcast = useCallback((next: T[]) => {
    busRef.current?.postMessage({ type: 'full', items: next });
  }, []);

  const msgColl = () => collection(getDb(), 'salasVirtuals', roomKey, collectionName);

  useEffect(() => {
    let cancelled = false;

    const startLocal = () => {
      if (cancelled) return;
      setItems(readLocal(storageKey, seed));
      setSyncStatus('local');

      if (typeof BroadcastChannel !== 'undefined') {
        const bus = new BroadcastChannel(busName);
        bus.onmessage = (event) => {
          const data = event.data as { type?: string; items?: T[] };
          if (data && data.type === 'full' && Array.isArray(data.items)) {
            setItems(data.items);
          }
        };
        busRef.current = bus;
      }
    };

    const seedIfEmpty = (size: number) => {
      if (size > 0 || cancelled) return;
      const lock = `foco-seed-${storageKey}`;
      if (localStorage.getItem(lock)) return;
      localStorage.setItem(lock, String(Date.now()));

      seed.forEach((item) => {
        setDoc(fsDoc(msgColl(), keyOf(item)), {
          ...toDoc(item),
          createdAt: serverTimestamp()
        }).catch(() => {});
      });

      window.setTimeout(() => localStorage.removeItem(lock), 60_000);
    };

    try {
      const q = query(msgColl(), orderBy('createdAt', 'asc'), limit(500));
      unsubRef.current = onSnapshot(
        q,
        (snap) => {
          if (cancelled) return;
          setSyncStatus('online');
          setItems(snap.docs.map((doc) => fromDoc(doc.id, doc.data() as Record<string, unknown>)));
          seedIfEmpty(snap.size);
        },
        (err) => {
          console.warn(`[sync:${collectionName}] Firestore indisponível, usando modo local.`, err);
          startLocal();
        }
      );
    } catch (e) {
      console.warn(`[sync:${collectionName}] Falha ao iniciar, usando modo local.`, e);
      startLocal();
    }

    return () => {
      cancelled = true;
      unsubRef.current?.();
      unsubRef.current = null;
      busRef.current?.close();
      busRef.current = null;
    };
  }, [options]);

  const addItem = useCallback(
    (item: T) => {
      const id = keyOf(item);
      const payload = { ...toDoc(item), createdAt: serverTimestamp() };

      if (syncStatus === 'online') {
        setDoc(fsDoc(msgColl(), id), payload).catch((err) => {
          console.warn(`[sync:${collectionName}] Falha no envio, salvando local.`, err);
          setSyncStatus('local');
          const next = readLocal(storageKey, seed).filter((x) => keyOf(x) !== id);
          next.push(item);
          writeLocal(storageKey, next);
          setItems(next);
          broadcast(next);
        });
        return;
      }

      const next = readLocal(storageKey, seed).filter((x) => keyOf(x) !== id);
      next.push(item);
      writeLocal(storageKey, next);
      setItems(next);
      broadcast(next);
    },
    [roomKey, collectionName, syncStatus, storageKey, seed, toDoc, keyOf, broadcast]
  );

  const updateItem = useCallback(
    (id: string, patch: Partial<T>) => {
      if (syncStatus === 'online') {
        setDoc(
          fsDoc(msgColl(), id),
          patch as Record<string, unknown>,
          { merge: true }
        ).catch((err) => {
          console.warn(`[sync:${collectionName}] Falha na atualização, salvando local.`, err);
          setSyncStatus('local');
          const next = readLocal(storageKey, seed).map((x) =>
            keyOf(x) === id ? { ...x, ...patch } : x
          );
          writeLocal(storageKey, next);
          setItems(next);
          broadcast(next);
        });
        return;
      }

      const next = readLocal(storageKey, seed).map((x) =>
        keyOf(x) === id ? { ...x, ...patch } : x
      );
      writeLocal(storageKey, next);
      setItems(next);
      broadcast(next);
    },
    [roomKey, collectionName, syncStatus, storageKey, seed, keyOf, broadcast]
  );

  return { items, syncStatus, addItem, updateItem };
}