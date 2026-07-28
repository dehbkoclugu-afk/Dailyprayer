import AsyncStorage from '@react-native-async-storage/async-storage';

/** Recover a single persisted slice when its JSON is truncated or corrupt. */
export const safeStorage = {
  async getItem(name: string) {
    const value = await AsyncStorage.getItem(name);
    if (value == null) return null;
    try {
      JSON.parse(value);
      return value;
    } catch {
      await AsyncStorage.removeItem(name);
      return null;
    }
  },
  setItem: AsyncStorage.setItem.bind(AsyncStorage),
  removeItem: AsyncStorage.removeItem.bind(AsyncStorage),
};
