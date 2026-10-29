import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safePersistStorage } from '@/state/safePersistStorage';
import type { HighlightColor } from '@/theme/highlights';
import { legacyVerseRef } from '@/data/bibleNav';

/**
 * Highlighted verses, keyed "BOOKCODE|chapter|verseLabel" -> color name.
 * v1 replaced the old string[] of keys (folded into gold marks); v2 moved from
 * verse array indices to labels — old index keys become "#<index>" so they
 * keep resolving to the same verse in the edition they were made in.
 */
interface HighlightState {
  marks: Record<string, HighlightColor>;
  /** set or replace a verse's color */
  set: (key: string, color: HighlightColor) => void;
  /** remove a highlight */
  clear: (key: string) => void;
  colorOf: (key: string) => HighlightColor | undefined;
}

export const useHighlightStore = create<HighlightState>()(
  persist(
    (set, get) => ({
      marks: {},
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
      version: 2,
      storage: createJSONStorage(() => safePersistStorage),
      migrate: (persisted, version) => {
        let marks: Record<string, HighlightColor> = {};
        if (version === 0 && persisted && Array.isArray((persisted as { keys?: string[] }).keys)) {
          for (const k of (persisted as { keys: string[] }).keys) marks[k] = 'gold';
        } else {
          marks = { ...((persisted as { marks?: Record<string, HighlightColor> })?.marks ?? {}) };
        }
        if (version < 2) {
          const migrated: Record<string, HighlightColor> = {};
          for (const [key, color] of Object.entries(marks)) {
            const [code, chapter, verse] = key.split('|');
            const index = Number(verse);
            if (!code || !Number.isInteger(Number(chapter)) || !Number.isInteger(index)) continue;
            migrated[`${code}|${chapter}|${legacyVerseRef(index)}`] = color;
          }
          marks = migrated;
        }
        return { marks } as HighlightState;
      },
    },
  ),
);
