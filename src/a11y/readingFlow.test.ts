import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(path, 'utf8');

test('search, prayer filters, show-all and journal delete expose visible 48dp controls', () => {
  const search = read('app/search.tsx');
  const pray = read('app/(tabs)/pray.tsx');
  const journal = read('app/(tabs)/journal.tsx');

  assert.match(search, /width: TAP_MIN,[\s\S]*?height: TAP_MIN,[\s\S]*?backgroundColor: t\.surfaceAlt/);
  assert.match(pray, /minHeight: TAP_MIN/);
  assert.match(pray, /onFocus=\{\(\) =>[\s\S]*?categoryList\.current\?\.scrollTo/);
  assert.match(pray, /backgroundColor: pressed \? t\.surfaceAlt : 'transparent'/);
  assert.match(journal, /width: TAP_MIN,[\s\S]*?height: TAP_MIN,[\s\S]*?backgroundColor: t\.surfaceAlt/);
  assert.match(journal, /color=\{t\.danger\}/);
});

test('reader settings preview the scale and use a native switch', () => {
  const settings = read('src/components/ReadingSettingsSheet.tsx');

  assert.match(settings, /fontSize: Math\.round\(18 \* fontScale\)/);
  assert.match(settings, /lineHeight: Math\.round\(28 \* fontScale\)/);
  assert.match(settings, /<Switch[\s\S]*?value=\{paper\}[\s\S]*?onValueChange=/);
  assert.match(settings, /accessibilityLabel=\{tr\('read\.paperMode'\)\}/);
  assert.doesNotMatch(settings, /accessibilityRole="switch"/);
});

test('reader exposes each verse as one labelled accessibility element', () => {
  const reader = read('app/read.tsx');

  assert.match(reader, /const verseA11y = \{[\s\S]*?accessible: true/);
  assert.match(reader, /accessibilityLabel: color[\s\S]*?`\$\{tr\('read\.verse'\)\} \$\{item\[0\]\}/);
  assert.equal([...reader.matchAll(/\{\.\.\.verseA11y\}/g)].length, 2);
});

test('screen readers pause automatic prayer progress and hear one line update', () => {
  const player = read('app/player.tsx');

  assert.match(player, /AccessibilityInfo\.isScreenReaderEnabled\(\)/);
  assert.match(player, /if \(enabled\) setPaused\(true\)/);
  assert.match(player, /if \(!accessibilityReady \|\| paused \|\| lastLine\) return/);
  assert.equal(
    [...player.matchAll(/announceForAccessibility\(/g)].length,
    1,
    'prayer line changes must have one announcement path',
  );
  assert.doesNotMatch(player, /accessibilityLiveRegion="polite"/);
  assert.match(player, /accessibilityLabel=\{`\$\{prayer\.title\}[\s\S]*?\$\{remainingMinutes\}/);
});
