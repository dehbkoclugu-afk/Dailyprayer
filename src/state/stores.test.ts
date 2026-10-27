import assert from 'node:assert/strict';
import test from 'node:test';
import AsyncStorage from '../../test/mocks/asyncStorage.ts';
import { dayKey, yesterdayKey } from '../lib/dates.ts';

const persisted = (state: unknown, version: number) => JSON.stringify({ state, version });

// Stores hydrate the moment they are imported, so storage is seeded first and
// the modules are imported once, with realistic async latency.
AsyncStorage.__reset(
  {
    'lumen-streak': persisted(
      { count: 5, bestCount: 5, totalDays: 9, lastTickDay: yesterdayKey(), doneDay: null, doneSteps: [] },
      0,
    ),
    'lumen-bookmarks': persisted(
      { bookmarks: [{ book: 42, chapter: 2, verse: 15, ref: 'John 3:16', preview: 'For God so loved', createdAt: 1 }] },
      0,
    ),
    'lumen-highlights': persisted({ marks: { 'JHN|2|15': 'rose' } }, 1),
    'lumen-reader': persisted({ book: 18, chapter: 22 }, 0),
    'lumen-entitlement': persisted({ isPlus: true, sawDiscountOffer: true }, 0),
  },
  5,
);

const { waitForHydration } = await import('./hydration.ts');
const { useStreakStore } = await import('./useStreakStore.ts');
const { useBookmarkStore } = await import('./useBookmarkStore.ts');
const { useHighlightStore } = await import('./useHighlightStore.ts');
const { useReaderStore } = await import('./useReaderStore.ts');
const { useEntitlementStore } = await import('./useEntitlementStore.ts');
await waitForHydration();

test('app-open tick after hydration continues the stored streak', () => {
  useStreakStore.getState().tickToday();
  const state = useStreakStore.getState();
  assert.equal(state.count, 6);
  assert.equal(state.lastTickDay, dayKey());
  assert.equal(state.totalDays, 10);
});

test('v0 bookmarks migrate from array indices to book code + legacy verse ref', () => {
  assert.deepEqual(useBookmarkStore.getState().bookmarks, [
    { code: 'JHN', chapter: 2, verse: '#15', ref: 'John 3:16', preview: 'For God so loved', createdAt: 1 },
  ]);
  assert.equal(useBookmarkStore.getState().has({ code: 'JHN', chapter: 2, verse: '#15' }), true);
});

test('v1 highlight keys keep pointing at the same verse after migration', () => {
  assert.deepEqual(useHighlightStore.getState().marks, { 'JHN|2|#15': 'rose' });
});

test('v0 reading position migrates from book index to canonical code', () => {
  assert.equal(useReaderStore.getState().bookCode, 'PSA');
  assert.equal(useReaderStore.getState().chapter, 22);
});

test('entitlement cache drops the retired discount flag and expires when lapsed', () => {
  const state = useEntitlementStore.getState();
  assert.equal(state.isPlus, true);
  assert.equal('sawDiscountOffer' in state, false);
  state.setEntitlement({ active: true, expiresAt: new Date(Date.now() - 1000).toISOString() });
  useEntitlementStore.getState().expireIfLapsed();
  assert.equal(useEntitlementStore.getState().isPlus, false);
});

test('bookmark removal can be undone', () => {
  const [bookmark] = useBookmarkStore.getState().bookmarks;
  useBookmarkStore.getState().remove(bookmark);
  assert.equal(useBookmarkStore.getState().bookmarks.length, 0);
  useBookmarkStore.getState().restore(bookmark);
  assert.deepEqual(useBookmarkStore.getState().bookmarks, [bookmark]);
});
