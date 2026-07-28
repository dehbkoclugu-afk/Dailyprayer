import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(path, 'utf8');

test('Reduce Motion replaces the completion shimmer with the static done state', () => {
  const card = read('src/components/RitualCard.tsx');

  assert.match(card, /done && !prevDone\.current && !reduceMotion/);
  assert.match(card, /entering=\{reduceMotion \? undefined : ZoomIn/);
  assert.match(card, /name="checkmark-circle"/);
});

test('completion and undo changes have one live announcement path', () => {
  const today = read('app/(tabs)/today.tsx');
  const plan = read('app/plan/[id]/[day].tsx');
  const devotional = read('app/devotional.tsx');
  const player = read('app/player.tsx');
  const journal = read('app/(tabs)/journal.tsx');
  const host = read('src/components/ToastHost.tsx');

  assert.match(today, /uncompleteStep\(step\);[\s\S]*?toast\(translate\('toast\.ritualUndone'\)\)/);
  assert.match(plan, /toggleDay\(plan\.id, dayIdx\);[\s\S]*?toast\(translate\('toast\.planDayComplete'\)\)/);
  assert.match(devotional, /completeStep\('devotional'\);[\s\S]*?toast\(translate\('toast\.devotional'\)\)/);
  assert.match(player, /completeStep\('prayer'\);[\s\S]*?toast\(translate\('toast\.prayer'\)\)/);
  assert.match(journal, /completeStep\('gratitude'\);[\s\S]*?toast\(translate\('toast\.gratitudeSaved'\)\)/);
  assert.equal(
    [...host.matchAll(/announceForAccessibility\(/g)].length,
    1,
    'ToastHost must announce each state message exactly once',
  );
});

test('PillButton distinguishes unavailable from working', () => {
  const button = read('src/components/PillButton.tsx');
  const paywall = read('app/paywall.tsx');

  assert.match(button, /busy\?: boolean/);
  assert.match(button, /const inactive = Boolean\(disabled \|\| busy\)/);
  assert.match(button, /accessibilityState=\{\{ disabled: inactive, busy \}\}/);
  assert.match(button, /busy \? \([\s\S]*?<ActivityIndicator/);
  assert.match(paywall, /busy=\{busy\}[\s\S]*?disabled=\{pending \|\| !selectedPlan\}/);
});

test('irreversible native confirmation is localized, cancellable and safely ordered', () => {
  const helper = read('src/a11y/confirmDestructive.ts');
  const library = read('app/library.tsx');

  const cancel = helper.indexOf("{ text: cancelLabel, style: 'cancel' }");
  const destructive = helper.indexOf("{ text: confirmLabel, style: 'destructive', onPress: onConfirm }");
  assert.ok(cancel >= 0 && destructive > cancel, 'cancel must come before the destructive action');
  assert.match(helper, /\{ cancelable: true \}/);
  assert.match(library, /confirmDestructive\(\{/);
  assert.match(library, /cancelLabel: tr\('data\.cancel'\)/);
  assert.match(library, /confirmLabel: tr\('library\.removeConfirm'\)/);
  assert.doesNotMatch(
    library,
    /onPress=\{\(\) =>\s*item\.markKey \? clearMark/,
    'the remove control must not delete immediately',
  );
});
