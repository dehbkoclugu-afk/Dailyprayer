import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(path, 'utf8');

test('final visual system and acceptance contracts stay wired', () => {
  const tokens = read('src/theme/tokens.ts');
  for (const role of ['onArtwork', 'sacredGold', 'scrim', 'interaction', 'motion', 'standard', 'hero', 'floating']) {
    assert.match(tokens, new RegExp(role));
  }
  const verse = read('src/components/VerseCard.tsx');
  assert.doesNotMatch(verse, /nestedScrollEnabled|<ScrollView/);
  assert.match(verse, /credit/);
  const matrix = read('docs/quality-matrices.md');
  for (const item of ['360×640', '390×844', 'foldable', 'landscape', '200%', 'Keyboard', 'Empty']) {
    assert.match(matrix, new RegExp(item, 'i'));
  }
});

test('performance and recovery release guards exist', () => {
  assert.match(read('app/search.tsx'), /searchScripture/);
  assert.match(read('src/data/scriptureSearch.ts'), /yieldToUI/);
  assert.match(read('src/data/bibleFull.ts'), /getBibleLoadMetrics/);
  assert.match(read('src/state/safeStorage.ts'), /JSON\.parse/);
  assert.match(read('scripts/check-bundle-budget.mjs'), /55\.8 MiB/);
  assert.match(read('scripts/generate-art-variants.py'), /480/);
});

test('Google Play release handoff contains no unsupported launch claims', () => {
  const scripts = JSON.parse(read('package.json')).scripts as Record<string, string>;
  assert.doesNotMatch(scripts['release-check'], /bundle-budget/);
  assert.match(scripts['release-artifact-check'], /bundle-budget/);

  const workflow = read('.github/workflows/android-aab.yml');
  assert.match(workflow, /EXPO_TOKEN/);
  assert.match(workflow, /--profile production/);
  assert.match(workflow, /--platform android/);

  const listing = read('docs/store-listing.md');
  assert.doesNotMatch(listing, /journal export|günlük dışa aktarma|exportación del diario|exportação do diário|export du journal|Tagebuch-Export/i);
  assert.doesNotMatch(listing, /helps give Lumen|ücretsiz ulaştırmaya|ayuda a regalar|ajuda a presentear|aide à offrir|jemandem zu schenken/i);
  assert.doesNotMatch(listing, /free trial is available|Ücretsiz deneme mevcut|Prueba gratuita disponible|Teste grátis disponível|Essai gratuit disponible|Kostenlose Testphase verfügbar/i);

  const privacy = read('docs/legal/privacy-policy.md');
  assert.doesNotMatch(privacy, /\[(?:COMPANY|CONTACT_EMAIL|JURISDICTION)\]/);
  assert.match(privacy, /dehbkoclugu@gmail\.com/);
  const handoff = read('docs/google-play-handoff.md');
  assert.match(handoff, /Purchase history/);
  assert.match(handoff, /first Google Play submission/);
  assert.match(handoff, /com\.lumen\.dailyprayer/);
  assert.match(handoff, /upload key/);
});
