import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

/**
 * Guards roadmap item 39: `busy` and `disabled` are different claims —
 * "loading right now" versus "not ready yet, and no work is happening" — and
 * `PillButton` used to make the first claim whenever the second was true.
 *
 * `accessibilityState={{ disabled: Boolean(disabled), busy: Boolean(disabled) }}`
 * meant every disabled PillButton in the app reported itself as *busy* to
 * TalkBack: Quiz's "Continue" before a name is typed, Journal's "Save" before
 * any text — neither loading, both announced as if they were.
 */

const read = (file: string) => readFileSync(join(...file.split('/')), 'utf8');

test('PillButton’s busy state comes from its own prop, not disabled', () => {
  const source = read('src/components/PillButton.tsx');
  assert.match(source, /busy\?: boolean/, 'a dedicated busy prop');
  assert.match(source, /accessibilityState=\{\{ disabled: inactive, busy: Boolean\(busy\) \}\}/);
  // The old shape, by name: busy sourced from the disabled boolean.
  assert.doesNotMatch(source, /busy: Boolean\(disabled\)/);
});

test('a busy PillButton shows a spinner and stays non-interactive', () => {
  const source = read('src/components/PillButton.tsx');
  assert.match(source, /const inactive = Boolean\(disabled\) \|\| Boolean\(busy\)/);
  assert.match(source, /\{busy \? <ActivityIndicator/);
  assert.match(source, /disabled=\{inactive\}/);
});

test('paywall’s purchase button passes busy separately from disabled', () => {
  // disabled still covers all three reasons (busy, a pending purchase, no
  // plan selected) — only `busy` should say which one is actually loading.
  const source = read('app/paywall.tsx');
  assert.match(source, /disabled=\{busy \|\| pending \|\| !selectedPlan\}\s*\n\s*busy=\{busy\}/);
});

test('the restore-purchases label matches what it visibly says while busy', () => {
  const source = read('app/paywall.tsx');
  assert.match(
    source,
    /accessibilityLabel=\{restoreStatus === 'busy' \? tr\('paywall\.restoring'\) : tr\('paywall\.restore'\)\}/,
  );
});
