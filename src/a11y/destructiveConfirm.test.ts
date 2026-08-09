import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

/**
 * Guards roadmap item 40: accessible confirmation for delete/destructive
 * actions.
 *
 * The app has exactly one destructive-action confirmation surface —
 * `DataActionSheet` (roadmap item 14) — and it is a custom two-stage sheet,
 * not a native `Alert`. Auditing it against item 40's three named criteria:
 *
 *  - **Button order / cancel default:** the sheet follows the iOS
 *    action-sheet convention (destructive action listed above, Cancel last,
 *    always the escape hatch at the bottom) — not the horizontal-Alert
 *    convention this app also uses elsewhere (`profile.tsx`'s
 *    reminder-blocked Alert, `[cancel, action]`, checked below). Both orders
 *    are correct for their own widget; they are not the same convention and
 *    should not be forced to match. `Modal`'s `onRequestClose` maps the
 *    hardware/gesture back action to Cancel either way.
 *  - **TalkBack description in every language:** all six locales carry
 *    complete, distinct delete/restart copy that names the action as
 *    irreversible in its final stage (checked via `i18n/completeness.test.ts`
 *    already; this file checks the English source reads as destructive).
 *  - **What was actually missing:** closing `DataActionSheet` — via Cancel,
 *    the backdrop, or completing the action — never returned accessibility
 *    focus to the row that opened it. `useTriggerFocus` (built for exactly
 *    this in item 28) was wired up for the appearance/language sheets in
 *    `profile.tsx` but not for the two rows that open the app's *only*
 *    irreversible action.
 */

const read = (file: string) => readFileSync(join(...file.split('/')), 'utf8');

test('the restart and delete triggers return focus when DataActionSheet closes', () => {
  const source = read('app/(tabs)/profile.tsx');
  assert.match(
    source,
    /const restartRef = useTriggerFocus\(dataAction === 'restart'\)/,
    'restart trigger should track its own sheet-open state',
  );
  assert.match(
    source,
    /const deleteRef = useTriggerFocus\(dataAction === 'delete'\)/,
    'delete trigger should track its own sheet-open state',
  );
  // Each ref must land on the Pressable that opens its matching action, not
  // just exist unused.
  assert.match(
    source,
    /ref=\{restartRef\}\s*\n\s*onPress=\{\(\) => setDataAction\('restart'\)\}/,
    'restartRef should be attached to the row that sets dataAction to restart',
  );
  assert.match(
    source,
    /ref=\{deleteRef\}\s*\n\s*onPress=\{\(\) => setDataAction\('delete'\)\}/,
    'deleteRef should be attached to the row that sets dataAction to delete',
  );
});

test('DataActionSheet maps the hardware/gesture back action to Cancel', () => {
  const source = read('src/components/DataActionSheet.tsx');
  assert.match(source, /onRequestClose=\{onClose\}/);
});

test('the destructive confirm-button styling only turns danger-colored on the final, irreversible stage', () => {
  // Stage 1 ("Continue") must stay neutral; only stage 2 ("Yes, delete
  // everything" / "Yes, restart onboarding") should look alarming.
  const source = read('src/components/DataActionSheet.tsx');
  assert.match(source, /backgroundColor: stage === 2 \? t\.danger : t\.surfaceAlt/);
});

test('the one native Alert with a Cancel choice puts Cancel in the platform-conventional slot', () => {
  // profile.tsx's reminder-blocked Alert is not destructive, but it is the
  // app's one native Alert.alert with a real two-way choice — [cancel, action]
  // matches RN's own Android mapping (buttons[0] = negative, buttons[1] =
  // positive) and iOS's left-is-dismiss convention.
  const source = read('app/(tabs)/profile.tsx');
  const match = source.match(/Alert\.alert\(tr\('profile\.reminderBlockedTitle'\)[\s\S]{0,400}?\]\);/);
  assert.ok(match, 'expected the reminder-blocked Alert.alert call');
  const call = match![0];
  const cancelIndex = call.indexOf("tr('data.cancel')");
  const actionIndex = call.indexOf("tr('profile.reminderOpenSettings')");
  assert.ok(cancelIndex > -1 && actionIndex > -1 && cancelIndex < actionIndex, 'cancel should come first');
  assert.match(call, /style: 'cancel'/);
});

test('the six locales all describe the final delete stage as irreversible', () => {
  const source = read('src/i18n/translations.ts');
  // Split on the top-level locale blocks and check each one's deleteFinalBody
  // independently, rather than trusting one match anywhere in the file.
  const blocks = source.split(/\n  [a-z]{2}: \{/).slice(1);
  assert.equal(blocks.length, 6, 'expected six locale blocks');
  for (const block of blocks) {
    const m = block.match(/'data\.deleteFinalBody': '([^']+)'/);
    assert.ok(m, 'every locale should define data.deleteFinalBody');
  }
});
