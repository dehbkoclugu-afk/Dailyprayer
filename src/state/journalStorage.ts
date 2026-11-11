import AsyncStorage from '@react-native-async-storage/async-storage';
import { AESEncryptionKey, AESSealedData, aesDecryptAsync, aesEncryptAsync } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { StateStorage } from 'zustand/middleware';
import { reportError } from '@/lib/reportError';
import {
  clearUnreadableStorage,
  isUnreadableStorage,
  markUnreadableStorage,
  safePersistStorage,
} from '@/state/safePersistStorage';

const JOURNAL_KEY = 'lumen-journal';
const SECRET_KEY = 'lumen-journal-aes-v1';
const PREFIX = 'aes-gcm-v1:';
let operation = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const result = operation.catch(() => {}).then(task);
  operation = result.then(() => {}, () => {});
  return result;
}

async function keyFor(encrypted: boolean): Promise<AESEncryptionKey> {
  let hex = await SecureStore.getItemAsync(SECRET_KEY);
  if (!hex) {
    if (encrypted) throw new Error('Journal encryption key is unavailable');
    const key = await AESEncryptionKey.generate();
    hex = await key.encoded('hex');
    await SecureStore.setItemAsync(SECRET_KEY, hex, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    return key;
  }
  return AESEncryptionKey.import(hex, 'hex');
}

async function seal(value: string): Promise<string> {
  const key = await keyFor(false);
  const encrypted = await aesEncryptAsync(new TextEncoder().encode(value), key);
  return PREFIX + await encrypted.combined('base64');
}

async function unseal(value: string): Promise<string> {
  const key = await keyFor(true);
  // Android's native fromCombined accepts only bytes; a base64 string throws there.
  const combined = Uint8Array.from(atob(value.slice(PREFIX.length)), (c) => c.charCodeAt(0));
  const encrypted = AESSealedData.fromCombined(combined);
  return new TextDecoder().decode(await aesDecryptAsync(encrypted, key));
}

/** The old plaintext value is removed only after an encrypted replacement is written. */
export const journalStorage: StateStorage = Platform.OS === 'web' ? safePersistStorage : {
  getItem: (name) => enqueue(async () => {
    if (name !== JOURNAL_KEY) throw new Error('Unexpected journal storage key');
    try {
      const stored = await AsyncStorage.getItem(name);
      if (stored === null) {
        clearUnreadableStorage(name);
        return null;
      }
      if (stored.startsWith(PREFIX)) {
        const value = await unseal(stored);
        JSON.parse(value);
        clearUnreadableStorage(name);
        return value;
      }
      JSON.parse(stored);
      const encrypted = await seal(stored);
      await AsyncStorage.setItem(name, encrypted);
      clearUnreadableStorage(name);
      return stored;
    } catch (error) {
      markUnreadableStorage(name);
      reportError(error, 'journal storage read or migration');
      return null;
    }
  }),
  setItem: (name, value) => enqueue(async () => {
    if (name !== JOURNAL_KEY || isUnreadableStorage(name)) {
      throw new Error('Journal storage unavailable; refusing to overwrite');
    }
    const current = await AsyncStorage.getItem(name);
    if (current?.startsWith(PREFIX)) await keyFor(true);
    await AsyncStorage.setItem(name, await seal(value));
  }),
  removeItem: (name) => enqueue(async () => {
    if (name !== JOURNAL_KEY || isUnreadableStorage(name)) {
      throw new Error('Journal storage unavailable; refusing to erase');
    }
    await AsyncStorage.removeItem(name);
  }),
};
