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
