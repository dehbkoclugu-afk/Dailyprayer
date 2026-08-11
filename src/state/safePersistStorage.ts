import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StateStorage } from 'zustand/middleware';

/**
 * Zustand parses persisted JSON after StateStorage returns it. Validate first so
 * a truncated/corrupt value resets only its own store instead of blocking app startup.
 */
export const safePersistStorage: StateStorage = {
  getItem: async (name) => {
    const value = await AsyncStorage.getItem(name);
    if (value === null) return null;
    try {
      JSON.parse(value);
      return value;
    } catch {
      await AsyncStorage.removeItem(name).catch(() => {});
      return null;
    }
  },
  setItem: (name, value) => AsyncStorage.setItem(name, value),
  removeItem: (name) => AsyncStorage.removeItem(name),
};
