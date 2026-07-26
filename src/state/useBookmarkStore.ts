import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Bookmark {
  /** canonical book index */
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

const keyOf = (b: number, c: number, v: number) => `${b}|${c}|${v}`;

interface BookmarkState {
  bookmarks: Bookmark[];
  has: (b: number, c: number, v: number) => boolean;
  add: (bm: Omit<Bookmark, 'createdAt'>) => void;
  remove: (b: number, c: number, v: number) => void;
  /** returns the new state (true = bookmarked) */
  toggle: (bm: Omit<Bookmark, 'createdAt'>) => boolean;
  /** Wipe every bookmark (see src/state/dataReset.ts). */
  reset: () => void;
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      reset: () => set({ bookmarks: [] }),
      has: (b, c, v) =>
        get().bookmarks.some((m) => m.book === b && m.chapter === c && m.verse === v),
      add: (bm) =>
        set((s) => ({
          bookmarks: [{ ...bm, createdAt: Date.now() }, ...s.bookmarks],
        })),
      remove: (b, c, v) =>
        set((s) => ({
          bookmarks: s.bookmarks.filter(
            (m) => keyOf(m.book, m.chapter, m.verse) !== keyOf(b, c, v),
          ),
        })),
      toggle: (bm) => {
        const on = !get().has(bm.book, bm.chapter, bm.verse);
        if (on) get().add(bm);
        else get().remove(bm.book, bm.chapter, bm.verse);
        return on;
      },
    }),
    { name: 'lumen-bookmarks', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
