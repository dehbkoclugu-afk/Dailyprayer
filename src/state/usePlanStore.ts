import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PlanState {
  /** planId → completed day indices (0-based) */
  progress: Record<string, number[]>;
  toggleDay: (planId: string, day: number) => void;
  isDone: (planId: string, day: number) => boolean;
  doneCount: (planId: string) => number;
  /** Drop all plan progress (see src/state/dataReset.ts). */
  reset: () => void;
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      progress: {},
      reset: () => set({ progress: {} }),
      toggleDay: (planId, day) =>
        set((s) => {
          const cur = s.progress[planId] ?? [];
          const next = cur.includes(day) ? cur.filter((d) => d !== day) : [...cur, day];
          return { progress: { ...s.progress, [planId]: next } };
        }),
      isDone: (planId, day) => (get().progress[planId] ?? []).includes(day),
      doneCount: (planId) => (get().progress[planId] ?? []).length,
    }),
    { name: 'lumen-plans', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
