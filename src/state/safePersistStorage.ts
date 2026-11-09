import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StateStorage } from 'zustand/middleware';
import { reportError } from '@/lib/reportError';

const unreadableKeys = new Set<string>();
export const hasUnreadableStorage = (): boolean => unreadableKeys.size > 0;
export const markUnreadableStorage = (name: string): void => { unreadableKeys.add(name); };
export const clearUnreadableStorage = (name: string): void => { unreadableKeys.delete(name); };
export const isUnreadableStorage = (name: string): boolean => unreadableKeys.has(name);

/**
 * Zustand parses persisted JSON after StateStorage returns it. Validate first so
 * a truncated/corrupt value resets only its own store instead of blocking app startup.
 */
export const safePersistStorage: StateStorage = {
  getItem: async (name) => {
    let value: string | null;
    try {
      value = await AsyncStorage.getItem(name);
      unreadableKeys.delete(name);
    } catch (error) {
      // A failed read is not corrupt data: leave the persisted value intact.
      reportError(error, `storage read: ${name}`);
      unreadableKeys.add(name);
      return null;
    }
    if (value === null) return null;
    try {
      JSON.parse(value);
      return value;
    } catch {
      await AsyncStorage.removeItem(name).catch(() => {});
      return null;
    }
  },
  setItem: (name, value) => unreadableKeys.has(name)
    ? Promise.reject(new Error(`Storage read failed; refusing to overwrite ${name}`))
    : AsyncStorage.setItem(name, value),
  removeItem: (name) => AsyncStorage.removeItem(name),
};
