import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('critical input and short-height flows keep scroll/IME recovery contracts', async () => {
  const [screen, quiz, journal, player, paywall] = await Promise.all([
    read('src/components/Screen.tsx'), read('app/onboarding/quiz.tsx'),
    read('app/(tabs)/journal.tsx'), read('app/player.tsx'), read('app/paywall.tsx'),
  ]);
  assert.match(screen, /KeyboardAvoidingView/);
  assert.match(screen, /keyboardShouldPersistTaps="handled"/);
  assert.match(quiz, /<Screen keyboardAware/);
  assert.match(journal, /keyboardAware/);
  assert.match(player, /<ScrollView/);
  assert.match(paywall, /isShortLayout/);
});

test('VerseCard grows with text and never creates a nested vertical scroll', async () => {
  const card = await read('src/components/VerseCard.tsx');
  assert.match(card, /minHeight: 340/);
  assert.doesNotMatch(card, /ScrollView/);
  assert.doesNotMatch(card, /numberOfLines=\{\d+\}/);
});

test('screen state matrix and code cover search, library, plan, paywall, notifications and purchases', async () => {
  const [matrix, search, library, plan, paywall, profile] = await Promise.all([
    read('docs/screen-state-matrix.md'), read('app/search.tsx'), read('app/library.tsx'),
    read('app/plan/[id]/index.tsx'), read('app/paywall.tsx'), read('app/(tabs)/profile.tsx'),
  ]);
  for (const label of ['Scripture Search', 'Library', 'Reading Plan', 'Paywall', 'Notifications', 'Purchases']) {
    assert.match(matrix, new RegExp(`\\| ${label} \\|`));
  }
  assert.match(search, /ActivityIndicator/);
  assert.match(library, /ListEmptyComponent/);
  assert.match(plan, /InvalidRouteState/);
  assert.match(paywall, /status === 'unavailable'/);
  assert.match(paywall, /restoreStatus === 'missing'/);
  assert.match(profile, /Linking\.openSettings/);
});

test('150 dp plan cards ship density-specific 1x and 2x artwork', async () => {
  for (const name of ['plan-cover', 'peace7', 'gratitude7', 'psalms30', 'gospels90', 'bible365']) {
    await access(new URL(`../src/assets/art/A13-${name}.webp`, import.meta.url));
    await access(new URL(`../src/assets/art/A13-${name}@2x.webp`, import.meta.url));
  }
});
