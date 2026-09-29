import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safePersistStorage } from '@/state/safePersistStorage';

interface ReaderState {
  /** last-read position: book index (canonical order) + chapter index (0-based) */
  book: number;
  chapter: number;
  verse: number;
  setPos: (book: number, chapter: number) => void;
  setVerse: (verse: number) => void;
}

export const useReaderStore = create<ReaderState>()(
  persist(
    (set) => ({
      book: 0,
      chapter: 0,
      verse: 0,
      setPos: (book, chapter) => set({ book, chapter, verse: 0 }),
      setVerse: (verse) => set({ verse }),
    }),
    { name: 'lumen-reader', storage: createJSONStorage(() => safePersistStorage) },
  ),
);
