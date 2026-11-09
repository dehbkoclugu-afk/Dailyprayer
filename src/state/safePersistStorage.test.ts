import test from 'node:test';
import assert from 'node:assert/strict';
import AsyncStorage from '../../test/mocks/asyncStorage.ts';
import { hasUnreadableStorage, safePersistStorage } from './safePersistStorage.ts';

test('failed storage read keeps existing data and can be retried', async () => {
  const originalValue = JSON.stringify({ state: { saved: true }, version: 1 });
  AsyncStorage.__reset({ 'failure-fixture': originalValue });
  const original = AsyncStorage.getItem;
  AsyncStorage.getItem = async () => { throw new Error('disk unavailable'); };
  try {
    assert.equal(await safePersistStorage.getItem('failure-fixture'), null);
    assert.equal(hasUnreadableStorage(), true);
    await assert.rejects(Promise.resolve(safePersistStorage.setItem('failure-fixture', 'replacement')));
  } finally {
    AsyncStorage.getItem = original;
  }
  assert.equal(AsyncStorage.__dump()['failure-fixture'], originalValue);
  assert.equal(await safePersistStorage.getItem('failure-fixture'), originalValue);
  assert.equal(hasUnreadableStorage(), false);
});
