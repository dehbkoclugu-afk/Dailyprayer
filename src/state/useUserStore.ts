import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeName } from '@/theme/tokens';

export interface QuizAnswers {
  name: string;
  tradition: string | null;
  goals: string[];
  struggles: string[];
  prayerTime: string | null; // 'HH:MM'
  experience: string | null;
}

interface UserState {
  onboarded: boolean;
  themePreference: ThemeName | 'system';
  quiz: QuizAnswers;
  setOnboarded: (v: boolean) => void;
  setThemePreference: (t: ThemeName | 'system') => void;
  setQuiz: (patch: Partial<QuizAnswers>) => void;
  reset: () => void;
}

const emptyQuiz: QuizAnswers = {
  name: '',
  tradition: null,
  goals: [],
  struggles: [],
  prayerTime: null,
  experience: null,
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      onboarded: false,
      themePreference: 'system',
      quiz: emptyQuiz,
      setOnboarded: (v) => set({ onboarded: v }),
      setThemePreference: (t) => set({ themePreference: t }),
      setQuiz: (patch) => set((s) => ({ quiz: { ...s.quiz, ...patch } })),
      reset: () => set({ onboarded: false, quiz: emptyQuiz }),
    }),
    { name: 'lumen-user', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
