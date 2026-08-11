import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safePersistStorage } from '@/state/safePersistStorage';
import type { ThemeName } from '@/theme/tokens';
import type { AppLocale } from '@/i18n/applicationLocales';
import type { GlobalLocaleTag } from '@/i18n/globalLanguageCatalog';

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
  /** 'system' = follow device locale (falls back to English) */
  language: AppLocale | 'system';
  /** Scripture language is independent from the app UI language. */
  scriptureLocale: GlobalLocaleTag | 'system';
  quiz: QuizAnswers;
  setOnboarded: (v: boolean) => void;
  setThemePreference: (t: ThemeName | 'system') => void;
  setLanguage: (l: AppLocale | 'system') => void;
  setScriptureLocale: (l: GlobalLocaleTag | 'system') => void;
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
      language: 'system',
      scriptureLocale: 'system',
      quiz: emptyQuiz,
      setOnboarded: (v) => set({ onboarded: v }),
      setThemePreference: (t) => set({ themePreference: t }),
      setLanguage: (l) => set({ language: l }),
      setScriptureLocale: (l) => set({ scriptureLocale: l }),
      setQuiz: (patch) => set((s) => ({ quiz: { ...s.quiz, ...patch } })),
      reset: () => set({ onboarded: false, quiz: emptyQuiz }),
    }),
    { name: 'lumen-user', storage: createJSONStorage(() => safePersistStorage) },
  ),
);
