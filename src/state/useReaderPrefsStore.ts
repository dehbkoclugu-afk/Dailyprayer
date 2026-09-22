import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safePersistStorage } from '@/state/safePersistStorage';

export const FONT_MIN = 0.9;
export const FONT_MAX = 1.5;
const STEP = 0.1;

interface ReaderPrefsState {
  /** multiplier applied to the reader's base type sizes */
  fontScale: number;
  /** warm "paper" reading surface instead of the app theme */
  paper: boolean;
  showGestureHint: boolean;
  bumpFont: (dir: 1 | -1) => void;
  togglePaper: () => void;
  dismissGestureHint: () => void;
}

const clamp = (n: number) => Math.min(FONT_MAX, Math.max(FONT_MIN, Math.round(n * 100) / 100));

export const useReaderPrefsStore = create<ReaderPrefsState>()(
  persist(
    (set) => ({
      fontScale: 1,
      paper: false,
      showGestureHint: true,
      bumpFont: (dir) => set((s) => ({ fontScale: clamp(s.fontScale + dir * STEP) })),
      togglePaper: () => set((s) => ({ paper: !s.paper })),
      dismissGestureHint: () => set({ showGestureHint: false }),
    }),
    { name: 'lumen-reader-prefs', storage: createJSONStorage(() => safePersistStorage) },
  ),
);
