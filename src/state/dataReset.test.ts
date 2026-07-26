import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

/**
 * Guards roadmap item 14 at the source level.
 *
 * `dataReset.ts` and the stores reach `@/`-aliased modules and AsyncStorage, which
 * the plain Node test runner cannot load, so these assertions read the source. They
 * cover the two promises the feature makes, both of which are easy to break by
 * adding a line in the wrong function:
 *
 * 1. Restarting onboarding resets the name and quiz only — never a streak, journal,
 *    highlights, bookmarks or plan progress.
 * 2. Deleting local data never touches the Plus entitlement, which belongs to the
 *    store account, and every store that holds personal history is actually reset.
 */

const resetSource = readFileSync('src/state/dataReset.ts', 'utf8');
const sheetSource = readFileSync('src/components/DataActionSheet.tsx', 'utf8');
const profileSource = readFileSync('app/(tabs)/profile.tsx', 'utf8');

/** Body of a named exported function, so assertions stay scoped to it. */
function functionBody(source: string, name: string): string {
  const start = source.indexOf(`export function ${name}(`);
  assert.notEqual(start, -1, `${name} is missing`);
  const open = source.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    else if (source[i] === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(open, i + 1);
    }
  }
  throw new Error(`could not read the body of ${name}`);
}

const HISTORY_STORES = [
  'useJournalStore',
  'useHighlightStore',
  'useBookmarkStore',
  'useStreakStore',
  'usePlanStore',
  'usePrayerStore',
  'useBibleStore',
  'useReaderStore',
];

test('restarting onboarding touches nothing but the user store', () => {
  const body = functionBody(resetSource, 'restartOnboarding');
  assert.match(body, /useUserStore\.getState\(\)\.reset\(\)/);
  for (const store of HISTORY_STORES) {
    assert.ok(
      !body.includes(store),
      `restartOnboarding must not touch ${store} — restarting onboarding is not a way to lose history`,
    );
  }
});

test('the user store reset is scoped to onboarding state', () => {
  // If this ever widens, restartOnboarding silently becomes destructive.
  const userSource = readFileSync('src/state/useUserStore.ts', 'utf8');
  const reset = userSource.match(/reset: \(\) => set\(\{([^}]*)\}\)/);
  assert.ok(reset, 'useUserStore.reset should set an explicit object');
  const keys = reset[1]
    .split(',')
    .map((part) => part.split(':')[0].trim())
    .filter(Boolean);
  assert.deepEqual(keys.sort(), ['onboarded', 'quiz']);
});

test('deleting all data resets every store that holds personal history', () => {
  const body = functionBody(resetSource, 'deleteAllUserData');
  for (const store of [...HISTORY_STORES, 'useUserStore']) {
    assert.match(
      body,
      new RegExp(`${store}\\.getState\\(\\)\\.reset\\(\\)`),
      `deleteAllUserData must reset ${store}`,
    );
  }
});

test('no reset path revokes the Plus entitlement', () => {
  // Plus belongs to the store account and is restored from it. Wiping it locally
  // would look like a paid feature being taken away. Checked against code only —
  // the module's comment names the store precisely to explain why it is excluded.
  const code = resetSource
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
  assert.ok(
    !code.includes('useEntitlementStore'),
    'dataReset must never import or reset useEntitlementStore',
  );
  for (const body of ['restartOnboarding', 'deleteAllUserData']) {
    assert.ok(
      !functionBody(resetSource, body).includes('Entitlement'),
      `${body} must not touch the entitlement store`,
    );
  }
});

test('every store that dataReset resets actually implements reset', () => {
  const files = {
    useJournalStore: 'src/state/useJournalStore.ts',
    useHighlightStore: 'src/state/useHighlightStore.ts',
    useBookmarkStore: 'src/state/useBookmarkStore.ts',
    useStreakStore: 'src/state/useStreakStore.ts',
    usePlanStore: 'src/state/usePlanStore.ts',
    usePrayerStore: 'src/state/usePrayerStore.ts',
    useBibleStore: 'src/state/useBibleStore.ts',
    useReaderStore: 'src/state/useReaderStore.ts',
    useUserStore: 'src/state/useUserStore.ts',
  };
  for (const [store, file] of Object.entries(files)) {
    const source = readFileSync(file, 'utf8');
    assert.match(source, /^\s*reset: \(\) =>/m, `${store} has no reset implementation`);
    assert.match(source, /reset: \(\) => void;/, `${store} does not declare reset in its interface`);
  }
});

test('both destructive actions are two-stage and reachable from Profile', () => {
  // Stage 1 shows the itemized lists; stage 2 is a separate deliberate confirmation.
  assert.match(sheetSource, /useState<1 \| 2>\(1\)/, 'the sheet must have two stages');
  assert.match(sheetSource, /if \(stage === 1\)[\s\S]{0,120}setStage\(2\)/, 'stage 1 must only advance');
  assert.match(sheetSource, /data\.willKeep/, 'the sheet must list what is kept');
  assert.match(sheetSource, /data\.willDelete/);
  assert.match(sheetSource, /data\.willReset/);

  // The action only runs once stage 2 has been reached.
  const confirm = sheetSource.slice(sheetSource.indexOf('const confirm = ()'));
  const advance = confirm.indexOf('setStage(2)');
  const performs = confirm.search(/deleteAllUserData\(\)|restartOnboarding\(\)/);
  assert.ok(advance !== -1 && performs > advance, 'the destructive call must sit after the stage gate');

  for (const action of ["setDataAction('restart')", "setDataAction('delete')"]) {
    assert.ok(profileSource.includes(action), `Profile must offer ${action}`);
  }
  assert.ok(
    !/onPress=\{reset\}/.test(profileSource),
    'Profile must not call reset directly — that was the one-tap data loss',
  );
});

test('the confirmation lists counts, not a vague warning', () => {
  assert.match(sheetSource, /collectDataSummary\(\)/);
  for (const key of [
    'data.itemJournal',
    'data.itemHighlights',
    'data.itemBookmarks',
    'data.itemStreak',
    'data.itemPlan',
    'data.keepPlus',
  ]) {
    assert.ok(sheetSource.includes(key), `the sheet must show ${key}`);
  }
});
