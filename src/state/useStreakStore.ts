import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dayKey, nextStreak } from '@/lib/dates';

export type RitualStep = 'verse' | 'devotional' | 'prayer' | 'gratitude';

interface StreakState {
  count: number;
  lastTickDay: string | null;
  bestCount: number;
  totalDays: number;
  /** steps completed for the current day, keyed by dayKey */
  doneDay: string | null;
  doneSteps: RitualStep[];
  /** Called on app open and on any completion. */
  tickToday: () => void;
  completeStep: (step: RitualStep) => void;
  uncompleteStep: (step: RitualStep) => void;
  isStepDone: (step: RitualStep) => boolean;
}

export const useStreakStore = create<StreakState>()(
  persist(
    (set, get) => ({
      count: 0,
      lastTickDay: null,
      bestCount: 0,
      totalDays: 0,
      doneDay: null,
      doneSteps: [],
      tickToday: () => {
        const { count, lastTickDay, bestCount, totalDays } = get();
        const today = dayKey();
        if (lastTickDay === today) return;
        const next = nextStreak(lastTickDay, count);
        set({
          count: next,
          lastTickDay: today,
          bestCount: Math.max(bestCount, next),
          totalDays: totalDays + 1,
        });
      },
      completeStep: (step) => {
        const today = dayKey();
        const { doneDay, doneSteps } = get();
        const steps = doneDay === today ? doneSteps : [];
        if (!steps.includes(step)) {
          set({ doneDay: today, doneSteps: [...steps, step] });
        }
        get().tickToday();
      },
      uncompleteStep: (step) => {
        const today = dayKey();
        const { doneDay, doneSteps } = get();
        if (doneDay === today) {
          set({ doneSteps: doneSteps.filter((item) => item !== step) });
        }
      },
      isStepDone: (step) => {
        const { doneDay, doneSteps } = get();
        return doneDay === dayKey() && doneSteps.includes(step);
      },
    }),
    { name: 'lumen-streak', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
