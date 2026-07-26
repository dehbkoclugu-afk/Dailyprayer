import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

/**
 * Guards roadmap item 15: deleting a journal entry must be undoable.
 *
 * A gratitude note or a verse someone saved while reading is exactly the kind of
 * thing a mis-tap on a small icon should not cost. Source-level assertions, because
 * the screen and stores reach `@/` aliases and AsyncStorage the plain Node test
 * runner cannot load.
 */

const journalScreen = readFileSync('app/(tabs)/journal.tsx', 'utf8');
const journalStore = readFileSync('src/state/useJournalStore.ts', 'utf8');
const toastHost = readFileSync('src/components/ToastHost.tsx', 'utf8');
const toastStore = readFileSync('src/state/useToastStore.ts', 'utf8');

test('deleting an entry offers it back instead of ending there', () => {
  assert.ok(
    !/onPress=\{\(\) => remove\(/.test(journalScreen),
    'the trash icon must not call remove directly — that is permanent deletion on one tap',
  );
  assert.match(journalScreen, /onPress=\{\(\) => deleteEntry\(e\)\}/);

  const start = journalScreen.indexOf('const deleteEntry =');
  assert.notEqual(start, -1, 'deleteEntry is missing');
  const body = journalScreen.slice(start, journalScreen.indexOf('const submit ='));
  assert.match(body, /remove\(entry\.id\)/, 'the entry should still be removed immediately');
  assert.match(body, /journal\.undo/, 'the toast must offer an undo label');
  assert.match(body, /restore\(entry\)/, 'undo must restore the entry that was deleted');
});

test('the entry is captured before deletion, not looked up afterwards', () => {
  // Passing the whole entry is what makes restore possible: once removed, an id
  // cannot be resolved back to its text, reference or timestamp.
  assert.match(journalScreen, /const deleteEntry = \(entry: JournalEntry\)/);
});

test('restore puts the entry back where it was', () => {
  const restore = journalStore.slice(journalStore.indexOf('restore: (entry)'));
  assert.match(restore, /filter\(\(e\) => e\.id !== entry\.id\)/, 'restore must not duplicate the entry');
  assert.match(restore, /sort\(\s*\(a, b\) => b\.createdAt - a\.createdAt,?\s*\)/, 'restore must re-sort by creation time');
});

test('an actionable toast can actually be tapped', () => {
  // The container used pointerEvents="none", which rendered the action and swallowed
  // every tap on it. No caller passed an action before, so nothing caught it.
  assert.ok(
    !/pointerEvents="none"[\s\S]{0,200}position: 'absolute'/.test(toastHost),
    'the toast container must not block touches with pointerEvents="none"',
  );
  assert.match(toastHost, /pointerEvents="box-none"/, 'the container should be box-none');
  assert.match(
    toastHost,
    /pointerEvents=\{hasAction \? 'auto' : 'none'\}/,
    'only an actionable toast should capture touches',
  );
});

test('an undo toast stays long enough to use', () => {
  const timer = toastHost.match(/setTimeout\(clear, ([^)]+)\)/);
  assert.ok(timer, 'the toast should auto-dismiss');
  assert.match(timer[1], /hasAction \? (\d{4,}) : \d+/, 'an actionable toast needs a longer timeout');
  const [, actionable] = timer[1].match(/hasAction \? (\d+)/) ?? [];
  assert.ok(Number(actionable) >= 4000, `an undo needs at least 4s, got ${actionable}ms`);
});

test('the undo is announced to screen readers', () => {
  assert.match(
    toastHost,
    /announceForAccessibility\(\s*hasAction \? `\$\{message\}\. \$\{actionLabel\}` : message,?\s*\)/,
    'a screen-reader user must be told the action is available, not only that something happened',
  );
});

test('the toast store carries the action through', () => {
  assert.match(toastStore, /actionLabel: string \| null;/);
  assert.match(toastStore, /action: \(\(\) => void\) \| null;/);
  assert.match(toastStore, /clear: \(\) => set\(\{ message: null, actionLabel: null, action: null \}\)/);
});
