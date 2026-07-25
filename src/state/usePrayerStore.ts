import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PrayerState {
  recentPrayerId: string | null;
  favoritePrayerIds: string[];
  markOpened: (id: string) => void;
  toggleFavorite: (id: string) => void;
}

export const usePrayerStore = create<PrayerState>()(
  persist(
    (set) => ({
      recentPrayerId: null,
      favoritePrayerIds: [],
      markOpened: (recentPrayerId) => set({ recentPrayerId }),
      toggleFavorite: (id) =>
        set((state) => ({
          favoritePrayerIds: state.favoritePrayerIds.includes(id)
            ? state.favoritePrayerIds.filter((item) => item !== id)
            : [...state.favoritePrayerIds, id],
        })),
    }),
    { name: 'lumen-prayers', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
