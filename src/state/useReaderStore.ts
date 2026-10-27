import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safePersistStorage } from '@/state/safePersistStorage';
import { bookMeta } from '@/data/bibleMeta';

interface ReaderState {
  /** last-read position: canonical book code + chapter index (0-based) */
  bookCode: string;
  chapter: number;
  setPos: (bookCode: string, chapter: number) => void;
}

const FIRST_BOOK = bookMeta[0]?.code ?? 'GEN';

export const useReaderStore = create<ReaderState>()(
  persist(
    (set) => ({
      bookCode: FIRST_BOOK,
      chapter: 0,
      setPos: (bookCode, chapter) => set({ bookCode, chapter }),
    }),
    {
      name: 'lumen-reader',
      version: 1,
      storage: createJSONStorage(() => safePersistStorage),
      // v0 stored the book as an index into whichever edition was open.
      migrate: (persisted, version) => {
        const value = (persisted ?? {}) as { book?: unknown; chapter?: unknown; bookCode?: unknown };
        const chapter = Number.isInteger(value.chapter) ? (value.chapter as number) : 0;
        if (version === 0) {
          const index = Number.isInteger(value.book) ? (value.book as number) : 0;
          return { bookCode: bookMeta[index]?.code ?? FIRST_BOOK, chapter };
        }
        return { bookCode: typeof value.bookCode === 'string' ? value.bookCode : FIRST_BOOK, chapter };
      },
    },
  ),
);
