import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { HighlightColor } from '@/theme/highlights';

/**
 * Highlighted verses, keyed "Book|chapter|verseIndex" -> color name.
 * (v1 replaced the old string[] of keys; the migration below folds those into
 * gold marks so nobody loses a highlight on upgrade.)
 */
interface HighlightState {
  marks: Record<string, HighlightColor>;
  /** set or replace a verse's color */
  set: (key: string, color: HighlightColor) => void;
  /** remove a highlight */
  clear: (key: string) => void;
  colorOf: (key: string) => HighlightColor | undefined;
  /** Wipe every highlight (see src/state/dataReset.ts). */
  reset: () => void;
}

export const useHighlightStore = create<HighlightState>()(
  persist(
    (set, get) => ({
      marks: {},
      reset: () => set({ marks: {} }),
      set: (key, color) => set((s) => ({ marks: { ...s.marks, [key]: color } })),
      clear: (key) =>
        set((s) => {
          const next = { ...s.marks };
          delete next[key];
          return { marks: next };
        }),
      colorOf: (key) => get().marks[key],
    }),
    {
      name: 'lumen-highlights',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persisted, version) => {
        if (version === 0 && persisted && Array.isArray((persisted as { keys?: string[] }).keys)) {
          const marks: Record<string, HighlightColor> = {};
          for (const k of (persisted as { keys: string[] }).keys) marks[k] = 'gold';
          return { marks };
        }
        return persisted as HighlightState;
      },
    },
  ),
);
