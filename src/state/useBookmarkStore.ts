import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safePersistStorage } from '@/state/safePersistStorage';
import { bookMeta } from '@/data/bibleMeta';
import { legacyVerseRef } from '@/data/bibleNav';

export interface Bookmark {
  /** canonical book code, e.g. "JHN" */
  code: string;
  /** 0-based chapter index */
  chapter: number;
  /** verse label ("16", "2-3") or legacy "#<index>" */
  verse: string;
  /** display reference at bookmark time, e.g. "Yuhanna 3:16" */
  ref: string;
  /** short preview of the verse text */
  preview: string;
  createdAt: number;
}

type BookmarkAddress = Pick<Bookmark, 'code' | 'chapter' | 'verse'>;

const same = (a: BookmarkAddress, b: BookmarkAddress) =>
  a.code === b.code && a.chapter === b.chapter && a.verse === b.verse;

interface BookmarkState {
  bookmarks: Bookmark[];
  has: (address: BookmarkAddress) => boolean;
  add: (bm: Omit<Bookmark, 'createdAt'>) => void;
  remove: (address: BookmarkAddress) => void;
  /** put back a removed bookmark (undo) */
  restore: (bm: Bookmark) => void;
  /** returns the new state (true = bookmarked) */
  toggle: (bm: Omit<Bookmark, 'createdAt'>) => boolean;
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      has: (address) => get().bookmarks.some((m) => same(m, address)),
      add: (bm) =>
        set((s) => ({
          bookmarks: [{ ...bm, createdAt: Date.now() }, ...s.bookmarks.filter((m) => !same(m, bm))],
        })),
      remove: (address) =>
        set((s) => ({ bookmarks: s.bookmarks.filter((m) => !same(m, address)) })),
      restore: (bm) =>
        set((s) => ({
          bookmarks: [bm, ...s.bookmarks.filter((m) => !same(m, bm))].sort(
            (a, b) => b.createdAt - a.createdAt,
          ),
        })),
      toggle: (bm) => {
        const on = !get().has(bm);
        if (on) get().add(bm);
        else get().remove(bm);
        return on;
      },
    }),
    {
      name: 'lumen-bookmarks',
      version: 1,
      storage: createJSONStorage(() => safePersistStorage),
      // v0 addressed bookmarks by book/verse array indices.
      migrate: (persisted, version) => {
        const value = (persisted ?? {}) as { bookmarks?: unknown };
        const list = Array.isArray(value.bookmarks) ? value.bookmarks : [];
        if (version !== 0) return { bookmarks: list as Bookmark[] };
        const bookmarks = list.flatMap((item) => {
          const old = item as { book?: number; chapter?: number; verse?: number; ref?: string; preview?: string; createdAt?: number };
          const code = typeof old.book === 'number' ? bookMeta[old.book]?.code : undefined;
          if (!code || typeof old.chapter !== 'number' || typeof old.verse !== 'number') return [];
          return [{
            code,
            chapter: old.chapter,
            verse: legacyVerseRef(old.verse),
            ref: old.ref ?? '',
            preview: old.preview ?? '',
            createdAt: old.createdAt ?? 0,
          }];
        });
        return { bookmarks };
      },
    },
  ),
);
