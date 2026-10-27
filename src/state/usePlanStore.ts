import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safePersistStorage } from '@/state/safePersistStorage';

interface PlanState {
  /** planId → completed day indices (0-based) */
  progress: Record<string, number[]>;
  toggleDay: (planId: string, day: number) => void;
  isDone: (planId: string, day: number) => boolean;
  doneCount: (planId: string) => number;
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      progress: {},
      toggleDay: (planId, day) =>
        set((s) => {
          const cur = s.progress[planId] ?? [];
          const next = cur.includes(day) ? cur.filter((d) => d !== day) : [...cur, day];
          return { progress: { ...s.progress, [planId]: next } };
        }),
      isDone: (planId, day) => (get().progress[planId] ?? []).includes(day),
      doneCount: (planId) => (get().progress[planId] ?? []).length,
    }),
    {
      name: 'lumen-plans',
      // Versioned so future shape changes ship with an explicit migration.
      version: 1,
      storage: createJSONStorage(() => safePersistStorage),
      migrate: (persisted) => persisted as PlanState,
    },
  ),
);
