import { useEffect, useRef, useState } from 'react';

/**
 * Acompanhamento de atenção do aluno dentro da Sala Virtual.
 *
 * Um site não consegue alterar o DNS do dispositivo nem bloquear sites, mas
 * detecta quando a aba do FOCO deixa de estar visível (troca de aba, minimizar
 * o navegador, mudar de janela) e registra esse tempo como "fora da aula".
 *
 * Tudo roda em modo local (mesmo navegador): localStorage + BroadcastChannel,
 * o que permite que 2+ abas do FOCO (uma com perfil aluno, outra professor)
 * se enxerguem em tempo real — o padrão já usado pelo resto do app.
 */

export type AttentionRole = 'professor' | 'aluno';
export type AwayReason = 'tab' | 'blur' | 'leave';

export interface AwayEvent {
  id: string;
  roomKey: string;
  tabId: string;
  userName: string;
  role: AttentionRole;
  reason: AwayReason;
  startedAt: number;
  endedAt: number;
  durationMs: number;
}

export interface AttendeeState {
  tabId: string;
  roomKey: string;
  userName: string;
  role: AttentionRole;
  joinedAt: number;
  lastSeen: number;
  isAway: boolean;
  awaySince?: number;
}

interface Snapshot {
  attendees: AttendeeState[];
  events: AwayEvent[];
}

type Listener = (snap: Snapshot) => void;

const STORAGE_ATTENDEES = 'foco-atencao-attendees';
const STORAGE_EVENTS = 'foco-atencao-events';
const BUS_NAME = 'foco-bus-atencao';

/** Só conta como "fora da aula" uma troca de aba/janela com 3s ou mais. */
export const AWAY_THRESHOLD_MS = 3000;

/** Elimina participantes sem batimento por > 90s (aba fechada de forma abrupta). */
const STALE_MS = 90_000;
const MAX_EVENTS = 500;

const listeners = new Set<Listener>();
let bus: BroadcastChannel | null = null;

function readAttendees(): AttendeeState[] {
  try {
    const raw = localStorage.getItem(STORAGE_ATTENDEES);
    return raw ? (JSON.parse(raw) as AttendeeState[]) : [];
  } catch {
    return [];
  }
}

function readEvents(): AwayEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_EVENTS);
    return raw ? (JSON.parse(raw) as AwayEvent[]) : [];
  } catch {
    return [];
  }
}

function writeAttendees(next: AttendeeState[]) {
  localStorage.setItem(STORAGE_ATTENDEES, JSON.stringify(next));
}

function writeEvents(next: AwayEvent[]) {
  localStorage.setItem(STORAGE_EVENTS, JSON.stringify(next));
}

function prune() {
  const now = Date.now();
  const attendees = readAttendees().filter((a) => now - a.lastSeen < STALE_MS);
  writeAttendees(attendees);
  const events = readEvents();
  if (events.length > MAX_EVENTS) {
    writeEvents(events.slice(events.length - MAX_EVENTS));
  }
}

function snapshot(): Snapshot {
  prune();
  return { attendees: readAttendees(), events: readEvents() };
}

function publish() {
  const snap = snapshot();
  listeners.forEach((l) => l(snap));
  bus?.postMessage(snap);
}

function initBus() {
  if (bus || typeof BroadcastChannel === 'undefined') return;
  bus = new BroadcastChannel(BUS_NAME);
  bus.onmessage = (event) => {
    const data = event.data as Snapshot | undefined;
    if (data && Array.isArray(data.attendees)) {
      const snap = snapshot();
      listeners.forEach((l) => l(snap));
    }
  };
}

export const attentionStore = {
  join(a: Omit<AttendeeState, 'lastSeen' | 'isAway'>) {
    initBus();
    const next = readAttendees().filter((x) => x.tabId !== a.tabId);
    next.push({ ...a, lastSeen: Date.now(), isAway: false });
    writeAttendees(next);
    publish();
  },
  heartbeat(tabId: string) {
    const now = Date.now();
    const next = readAttendees().map((x) => (x.tabId === tabId ? { ...x, lastSeen: now } : x));
    writeAttendees(next);
  },
  setAway(tabId: string, isAway: boolean) {
    const now = Date.now();
    const events = readEvents();
    const attendees = readAttendees().map((x) => {
      if (x.tabId !== tabId) return x;
      if (isAway && !x.isAway) {
        return { ...x, isAway: true, awaySince: now };
      }
      if (!isAway && x.isAway && x.awaySince) {
        const durationMs = now - x.awaySince;
        if (durationMs >= AWAY_THRESHOLD_MS) {
          events.push({
            id: `${x.tabId}-${x.awaySince}`,
            roomKey: x.roomKey,
            tabId: x.tabId,
            userName: x.userName,
            role: x.role,
            reason: 'tab',
            startedAt: x.awaySince,
            endedAt: now,
            durationMs
          });
        }
        return { ...x, isAway: false, awaySince: undefined };
      }
      return x;
    });
    if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);
    writeEvents(events);
    writeAttendees(attendees);
    publish();
  },
  leave(tabId: string) {
    writeAttendees(readAttendees().filter((x) => x.tabId !== tabId));
    publish();
  },
  subscribe(l: Listener) {
    initBus();
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }
};

export function formatDuration(ms: number): string {
  const totalSecs = Math.max(0, Math.round(ms / 1000));
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  if (mins > 0) return `${mins}min ${secs}s`;
  return `${secs}s`;
}

interface AttentionUser {
  id: string;
  name: string;
  role: string;
}

export function useRoomAttention(roomKey: string, currentUser: AttentionUser) {
  const tabIdRef = useRef<string>(`${roomKey}-${Math.random().toString(36).slice(2, 10)}`);
  const awayRef = useRef<{ at: number } | null>(null);
  const [snap, setSnap] = useState<Snapshot>(() => {
    const s = snapshot();
    return { attendees: s.attendees.filter((a) => a.roomKey === roomKey), events: s.events.filter((e) => e.roomKey === roomKey) };
  });
  const [myLastAway, setMyLastAway] = useState<AwayEvent | null>(null);

  useEffect(() => {
    const tabId = tabIdRef.current;
    const tracked = currentUser.role === 'aluno';

    attentionStore.join({
      tabId,
      roomKey,
      userName: currentUser.name,
      role: currentUser.role === 'professor' ? 'professor' : 'aluno',
      joinedAt: Date.now()
    });

    const heartbeat = setInterval(() => attentionStore.heartbeat(tabId), 4000);
    const unsubscribe = attentionStore.subscribe((next) => {
      setSnap({
        attendees: next.attendees.filter((a) => a.roomKey === roomKey),
        events: next.events.filter((e) => e.roomKey === roomKey)
      });
    });

    const toAway = () => {
      if (!tracked || awayRef.current != null) return;
      awayRef.current = { at: Date.now() };
      attentionStore.setAway(tabId, true);
    };
    const back = () => {
      if (awayRef.current == null) return;
      const started = awayRef.current.at;
      awayRef.current = null;
      attentionStore.setAway(tabId, false);
      const last = readEvents()
        .filter((e) => e.tabId === tabId && e.startedAt === started && e.durationMs >= AWAY_THRESHOLD_MS)
        .slice(-1)[0];
      if (last) setMyLastAway(last);
    };

    const onVisibility = () =>
      document.visibilityState === 'hidden' ? toAway() : back();
    const onBlur = () => toAway();
    const onFocus = () => back();
    const onPageHide = () => {
      back();
      attentionStore.leave(tabId);
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    window.addEventListener('pagehide', onPageHide);

    return () => {
      clearInterval(heartbeat);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('pagehide', onPageHide);
      unsubscribe();
      attentionStore.leave(tabId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomKey, currentUser.id]);

  const clearMyLastAway = () => setMyLastAway(null);
  const attendees = snap.attendees;
  const events = snap.events;
  const awayCount = attendees.filter((a) => a.isAway && a.role === 'aluno').length;
  const totalAwayMs = events.reduce((sum, e) => sum + e.durationMs, 0);
  const totalAwayFor = (userName: string) =>
    events.filter((e) => e.userName === userName).reduce((sum, e) => sum + e.durationMs, 0);

  return { attendees, events, awayCount, totalAwayMs, totalAwayFor, myLastAway, clearMyLastAway };
}