import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safePersistStorage } from '@/state/safePersistStorage';

interface ReaderState {
  /** last-read position: book index (canonical order) + chapter index (0-based) */
  book: number;
  chapter: number;
  setPos: (book: number, chapter: number) => void;
}

export const useReaderStore = create<ReaderState>()(
  persist(
    (set) => ({
      book: 0,
      chapter: 0,
      setPos: (book, chapter) => set({ book, chapter }),
    }),
    { name: 'lumen-reader', storage: createJSONStorage(() => safePersistStorage) },
  ),
);
