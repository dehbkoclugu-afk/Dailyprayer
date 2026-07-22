import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dayKey } from '@/lib/dates';

export interface JournalEntry {
  id: string;
  day: string;
  kind: 'gratitude' | 'prayer-request' | 'verse';
  text: string;
  /** scripture reference, set when kind === 'verse' */
  ref?: string;
  answered?: boolean;
  createdAt: number;
}

interface JournalState {
  entries: JournalEntry[];
  add: (kind: JournalEntry['kind'], text: string, ref?: string) => void;
  remove: (id: string) => void;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set) => ({
      entries: [],
      add: (kind, text, ref) =>
        set((s) => ({
          entries: [
            {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              day: dayKey(),
              kind,
              text: text.trim(),
              ...(ref ? { ref } : {}),
              answered: false,
              createdAt: Date.now(),
            },
            ...s.entries,
          ],
        })),
      remove: (id) =>
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
    }),
    { name: 'lumen-journal', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
