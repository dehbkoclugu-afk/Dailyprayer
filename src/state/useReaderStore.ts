import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from './safeStorage';

interface ReaderState {
  /** last-read position: book index (canonical order) + chapter index (0-based) */
  book: number;
  chapter: number;
  verse: number;
  setPos: (book: number, chapter: number, verse?: number) => void;
  setVerse: (verse: number) => void;
  /** Forget the reading position (see src/state/dataReset.ts). */
  reset: () => void;
}

export const useReaderStore = create<ReaderState>()(
  persist(
    (set) => ({
      book: 0,
      chapter: 0,
      verse: 0,
      setPos: (book, chapter, verse = 0) => set({ book, chapter, verse }),
      setVerse: (verse) => set({ verse }),
      reset: () => set({ book: 0, chapter: 0, verse: 0 }),
    }),
    { name: 'lumen-reader', storage: createJSONStorage(() => safeStorage) },
  ),
);
