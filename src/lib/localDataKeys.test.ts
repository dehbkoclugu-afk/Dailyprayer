import assert from 'node:assert/strict';
import test from 'node:test';
import { selectLocalUserDataKeys } from './localDataKeys.ts';

test('selects only Lumen user-state and player-position keys', () => {
  assert.deepEqual(
    selectLocalUserDataKeys([
      'lumen-user',
      'lumen-journal',
      'lumen-player-prayer-1',
      'lumen-entitlement',
      'lumen-application-content-v1',
      'expo-unrelated',
    ]),
    ['lumen-user', 'lumen-journal', 'lumen-player-prayer-1'],
  );
});
