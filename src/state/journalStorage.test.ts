import assert from 'node:assert/strict';
import test from 'node:test';
import AsyncStorage from '../../test/mocks/asyncStorage.ts';
import { __reset as resetSecrets } from '../../test/mocks/expoSecureStore.ts';
import { journalStorage } from './journalStorage.ts';

const name = 'lumen-journal';
const oldValue = JSON.stringify({ state: { entries: [{ text: 'private prayer' }] }, version: 1 });

test('migrates plaintext journal without losing the entry', async () => {
  resetSecrets();
  AsyncStorage.__reset({ [name]: oldValue });
  assert.equal(await journalStorage.getItem(name), oldValue);
  const encrypted = AsyncStorage.__dump()[name];
  assert.ok(encrypted.startsWith('aes-gcm-v1:'));
  assert.ok(!encrypted.includes('private prayer'));
  assert.equal(await journalStorage.getItem(name), oldValue);
});

test('missing key does not erase or overwrite encrypted journal', async () => {
  resetSecrets();
  AsyncStorage.__reset();
  await journalStorage.setItem(name, oldValue);
  const encrypted = AsyncStorage.__dump()[name];
  resetSecrets();
  assert.equal(await journalStorage.getItem(name), null);
  await assert.rejects(async () => { await journalStorage.setItem(name, oldValue); });
  assert.equal(AsyncStorage.__dump()[name], encrypted);
});
