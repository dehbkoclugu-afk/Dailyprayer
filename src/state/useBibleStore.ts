import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safePersistStorage } from '@/state/safePersistStorage';

interface BibleState {
  chapterIndex: number;
  savedVerseKeys: string[];
  planProgress: Record<string, number>;
  setChapterIndex: (index: number) => void;
  toggleSavedVerse: (key: string) => boolean;
  startPlan: (planId: string) => void;
  completePlanDay: (planId: string, totalDays: number) => void;
}

export const useBibleStore = create<BibleState>()(
  persist(
    (set, get) => ({
      chapterIndex: 0,
      savedVerseKeys: [],
      planProgress: {},
      setChapterIndex: (chapterIndex) => set({ chapterIndex }),
      toggleSavedVerse: (key) => {
        const saved = !get().savedVerseKeys.includes(key);
        set((state) => ({
          savedVerseKeys: saved
            ? [...state.savedVerseKeys, key]
            : state.savedVerseKeys.filter((item) => item !== key),
        }));
        return saved;
      },
      startPlan: (planId) =>
        set((state) => ({
          planProgress: {
            ...state.planProgress,
            [planId]: Math.max(1, state.planProgress[planId] ?? 0),
          },
        })),
      completePlanDay: (planId, totalDays) =>
        set((state) => ({
          planProgress: {
            ...state.planProgress,
            [planId]: Math.min(totalDays, (state.planProgress[planId] ?? 0) + 1),
          },
        })),
    }),
    { name: 'lumen-bible', storage: createJSONStorage(() => safePersistStorage) },
  ),
);
