import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safePersistStorage } from '@/state/safePersistStorage';
import { bookMeta } from '@/data/bibleMeta';
import bookNames from '@/data/bible-book-names.json';

export interface Bookmark {
  /** Stable USFX/OSIS book code; survives canon/order changes. */
  code: string;
  /** legacy canonical index, retained only for migration compatibility */
  book: number;
  /** 0-based chapter index */
  chapter: number;
  /** 0-based verse index within the chapter */
  verse: number;
  /** display reference, e.g. "Yuhanna 3:16" */
  ref: string;
  /** short preview of the verse text */
  preview: string;
  createdAt: number;
}

const keyOf = (code: string, c: number, v: number) => `${code}|${c}|${v}`;

const CATHOLIC_BOOK_ALIASES: Record<string, string[]> = {
  TOB: ['Tobija', 'Tobit'],
  JDT: ['Judita', 'Judith'],
  ESG: ['Grčka Estera', 'Ester (grčki)', 'Esther Greek'],
  WIS: ['Mudrost', 'Knjiga Mudrosti', 'Wisdom'],
  SIR: ['Sirah', 'Knjiga Sirahova', 'Sirach'],
  BAR: ['Baruh', 'Baruch'],
  '1MA': ['1. Makabejcima', '1 Makabejcima', '1 Maccabees'],
  '2MA': ['2. Makabejcima', '2 Makabejcima', '2 Maccabees'],
};

function inferBookCode(book: number, ref: string): string {
  const normalized = ref.toLocaleLowerCase();
  const candidates = Object.entries(bookNames as Record<string, Record<string, string>>)
    .flatMap(([code, names]) => Object.values(names).map((name) => ({ code, name })))
    .concat(Object.entries(CATHOLIC_BOOK_ALIASES).flatMap(([code, names]) =>
      names.map((name) => ({ code, name }))))
    .filter(({ name }) => normalized.startsWith(name.toLocaleLowerCase()))
    .sort((a, b) => b.name.length - a.name.length);
  return candidates[0]?.code ?? bookMeta[book]?.code ?? 'GEN';
}

interface BookmarkState {
  bookmarks: Bookmark[];
  has: (code: string, c: number, v: number) => boolean;
  add: (bm: Omit<Bookmark, 'createdAt'>) => void;
  remove: (code: string, c: number, v: number) => void;
  /** returns the new state (true = bookmarked) */
  toggle: (bm: Omit<Bookmark, 'createdAt'>) => boolean;
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      has: (code, c, v) =>
        get().bookmarks.some((m) => m.code === code && m.chapter === c && m.verse === v),
      add: (bm) =>
        set((s) => ({
          bookmarks: [{ ...bm, createdAt: Date.now() }, ...s.bookmarks],
        })),
      remove: (code, c, v) =>
        set((s) => ({
          bookmarks: s.bookmarks.filter(
            (m) => keyOf(m.code, m.chapter, m.verse) !== keyOf(code, c, v),
          ),
        })),
      toggle: (bm) => {
        const on = !get().has(bm.code, bm.chapter, bm.verse);
        if (on) get().add(bm);
        else get().remove(bm.code, bm.chapter, bm.verse);
        return on;
      },
    }),
    {
      name: 'lumen-bookmarks',
      version: 1,
      storage: createJSONStorage(() => safePersistStorage),
      migrate: (persisted, version) => {
        const state = persisted as { bookmarks?: (Bookmark & { code?: string })[] };
        if (version === 0 && Array.isArray(state?.bookmarks)) {
          return {
            ...state,
            bookmarks: state.bookmarks.map((bookmark) => ({
              ...bookmark,
              code: bookmark.code ?? inferBookCode(bookmark.book, bookmark.ref),
            })),
          };
        }
        return persisted as BookmarkState;
      },
    },
  ),
);
