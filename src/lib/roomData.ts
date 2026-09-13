import { useCallback, useMemo } from 'react';
import { RoomPoll, RoomMaterial, RoomLink } from '../types';
import {
  INITIAL_ROOM_POLLS,
  INITIAL_ROOM_MATERIALS,
  INITIAL_ROOM_LINKS
} from '../data/mockData';
import { useSyncedCollection } from './useSyncedCollection';

type DocData = Record<string, unknown>;

/* ------------------------------- ENQUETES ------------------------------- */

const toPollDoc = (p: RoomPoll): DocData => ({
  question: p.question,
  options: p.options.map((o) => ({ id: o.id, label: o.label, votes: o.votes })),
  isOpen: p.isOpen,
  createdAtLabel: p.createdAt,
  createdBy: p.createdBy
});

const pollFromDoc = (id: string, d: DocData): RoomPoll => ({
  id,
  question: String(d.question || ''),
  options: Array.isArray(d.options)
    ? (d.options as Array<{ id?: unknown; label?: unknown; votes?: unknown }>).map((o) => ({
        id: String(o.id),
        label: String(o.label || ''),
        votes: Number(o.votes) || 0
      }))
    : [],
  isOpen: d.isOpen !== false,
  createdAt: String(d.createdAtLabel || ''),
  createdBy: String(d.createdBy || '')
});

export function useRoomPolls(roomKey: string) {
  const options = useMemo(
    () => ({
      roomKey,
      collectionName: 'enquetes',
      seed: INITIAL_ROOM_POLLS,
      toDoc: toPollDoc,
      fromDoc: pollFromDoc,
      keyOf: (p: RoomPoll) => p.id
    }),
    [roomKey]
  );

  const { items, syncStatus, addItem, updateItem } = useSyncedCollection<RoomPoll>(options);

  const launchPoll = useCallback(
    (question: string, optionLabels: string[], author: string) => {
      const id = `poll-${Date.now()}`;
      addItem({
        id,
        question,
        options: optionLabels.map((label, i) => ({
          id: `${id}-${i}`,
          label,
          votes: 0
        })),
        isOpen: true,
        createdAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        createdBy: author
      });
    },
    [addItem]
  );

  const votePoll = useCallback(
    (pollId: string, optionId: string) => {
      const poll = items.find((p) => p.id === pollId);
      if (!poll) return;
      const nextOptions = poll.options.map((o) =>
        o.id === optionId ? { ...o, votes: o.votes + 1 } : o
      );
      updateItem(pollId, { options: nextOptions });
    },
    [items, updateItem]
  );

  const togglePollStatus = useCallback(
    (pollId: string) => {
      const poll = items.find((p) => p.id === pollId);
      if (!poll) return;
      updateItem(pollId, { isOpen: !poll.isOpen });
    },
    [items, updateItem]
  );

  return { polls: items, syncStatus, launchPoll, votePoll, togglePollStatus };
}

/* ------------------------------ MATERIAIS ------------------------------- */

const toMaterialDoc = (m: RoomMaterial): DocData => ({
  title: m.title,
  type: m.type,
  description: m.description || '',
  fileSize: m.fileSize || '',
  url: m.url,
  previewUrl: m.previewUrl || ''
});

const materialFromDoc = (id: string, d: DocData): RoomMaterial => ({
  id,
  title: String(d.title || ''),
  type: String(d.type || 'pdf') as RoomMaterial['type'],
  description: String(d.description || '') || undefined,
  fileSize: String(d.fileSize || '') || undefined,
  url: String(d.url || ''),
  previewUrl: String(d.previewUrl || '') || undefined
});

export function useRoomMaterials(roomKey: string) {
  const options = useMemo(
    () => ({
      roomKey,
      collectionName: 'materiais',
      seed: INITIAL_ROOM_MATERIALS,
      toDoc: toMaterialDoc,
      fromDoc: materialFromDoc,
      keyOf: (m: RoomMaterial) => m.id
    }),
    [roomKey]
  );

  const { items, syncStatus, addItem } = useSyncedCollection<RoomMaterial>(options);

  const addMaterial = useCallback((material: RoomMaterial) => addItem(material), [addItem]);

  return { materials: items, syncStatus, addMaterial };
}

/* -------------------------------- LINKS --------------------------------- */

const toLinkDoc = (l: RoomLink): DocData => ({
  title: l.title,
  description: l.description || '',
  url: l.url,
  icon: l.icon || 'link',
  tag: l.tag || ''
});

const linkFromDoc = (id: string, d: DocData): RoomLink => ({
  id,
  title: String(d.title || ''),
  description: String(d.description || '') || undefined,
  url: String(d.url || ''),
  icon: String(d.icon || 'link'),
  tag: String(d.tag || '') || undefined
});

export function useRoomLinks(roomKey: string) {
  const options = useMemo(
    () => ({
      roomKey,
      collectionName: 'links',
      seed: INITIAL_ROOM_LINKS,
      toDoc: toLinkDoc,
      fromDoc: linkFromDoc,
      keyOf: (l: RoomLink) => l.id
    }),
    [roomKey]
  );

  const { items, syncStatus, addItem } = useSyncedCollection<RoomLink>(options);

  const addLink = useCallback((link: RoomLink) => addItem(link), [addItem]);

  return { links: items, syncStatus, addLink };
}