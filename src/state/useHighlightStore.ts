import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Highlighted verses, keyed "Book|chapter|verseIndex". */
interface HighlightState {
  keys: string[];
  toggle: (key: string) => boolean; // returns new state (true = highlighted)
  has: (key: string) => boolean;
}

export const useHighlightStore = create<HighlightState>()(
  persist(
    (set, get) => ({
      keys: [],
      toggle: (key) => {
        const on = !get().keys.includes(key);
        set((s) => ({
          keys: on ? [...s.keys, key] : s.keys.filter((k) => k !== key),
        }));
        return on;
      },
      has: (key) => get().keys.includes(key),
    }),
    { name: 'lumen-highlights', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
