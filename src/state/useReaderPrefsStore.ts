import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const FONT_MIN = 0.9;
export const FONT_MAX = 1.5;
const STEP = 0.1;

interface ReaderPrefsState {
  /** multiplier applied to the reader's base type sizes */
  fontScale: number;
  /** warm "paper" reading surface instead of the app theme */
  paper: boolean;
  readerHintSeen: boolean;
  bumpFont: (dir: 1 | -1) => void;
  togglePaper: () => void;
  dismissReaderHint: () => void;
}

const clamp = (n: number) => Math.min(FONT_MAX, Math.max(FONT_MIN, Math.round(n * 100) / 100));

export const useReaderPrefsStore = create<ReaderPrefsState>()(
  persist(
    (set) => ({
      fontScale: 1,
      paper: false,
      readerHintSeen: false,
      bumpFont: (dir) => set((s) => ({ fontScale: clamp(s.fontScale + dir * STEP) })),
      togglePaper: () => set((s) => ({ paper: !s.paper })),
      dismissReaderHint: () => set({ readerHintSeen: true }),
    }),
    { name: 'lumen-reader-prefs', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
