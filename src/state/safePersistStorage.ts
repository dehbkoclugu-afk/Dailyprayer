import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StateStorage } from 'zustand/middleware';

const object = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const integer = (value: unknown) => Number.isSafeInteger(value) && Number(value) >= 0;

function validPersistedShape(name: string, value: unknown): boolean {
  if (!object(value) || !object(value.state)) return false;
  const state = value.state;
  switch (name) {
    case 'lumen-reader':
      return integer(state.book) && integer(state.chapter) && integer(state.verse);
    case 'lumen-reader-prefs':
      return typeof state.fontScale === 'number' && Number.isFinite(state.fontScale)
        && typeof state.paper === 'boolean' && typeof state.showGestureHint === 'boolean';
    case 'lumen-entitlement':
      return typeof state.isPlus === 'boolean' && typeof state.sawDiscountOffer === 'boolean';
    case 'lumen-streak':
      return integer(state.count) && integer(state.bestCount) && integer(state.totalDays)
        && Array.isArray(state.activeDays) && Array.isArray(state.doneSteps);
    case 'lumen-journal': return Array.isArray(state.entries);
    case 'lumen-bookmarks': return Array.isArray(state.bookmarks);
    case 'lumen-highlights': return object(state.marks) || Array.isArray(state.keys);
    case 'lumen-plans': return object(state.progress);
    case 'lumen-prayers': return Array.isArray(state.favoritePrayerIds);
    case 'lumen-user': return typeof state.onboarded === 'boolean' && object(state.quiz);
    default: return true;
  }
}

/**
 * Zustand parses persisted JSON after StateStorage returns it. Validate first so
 * a truncated/corrupt value resets only its own store instead of blocking app startup.
 */
export const safePersistStorage: StateStorage = {
  getItem: async (name) => {
    const value = await AsyncStorage.getItem(name);
    if (value === null) return null;
    try {
      const parsed: unknown = JSON.parse(value);
      if (!validPersistedShape(name, parsed)) throw new Error('Persisted state shape is invalid');
      return value;
    } catch {
      await AsyncStorage.removeItem(name).catch(() => {});
      return null;
    }
  },
  setItem: (name, value) => AsyncStorage.setItem(name, value),
  removeItem: (name) => AsyncStorage.removeItem(name),
};
