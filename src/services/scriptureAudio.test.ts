import assert from 'node:assert/strict';
import test from 'node:test';
import { getScriptureAudioSource } from './scriptureAudio.ts';

test('matches only exact enabled Scripture editions', () => {
  const editions = [
    'World English Bible',
    'Yorumsuz Türkçe Çeviri (YTC)',
    'Reina-Valera 1909',
    'Louis Segond 1910',
    'Lutherbibel 1912',
  ];
  assert.equal(new Set(editions.map((edition) => getScriptureAudioSource(edition)?.id)).size, editions.length);
  assert.equal(getScriptureAudioSource('Japanese Freedom Bible 2026'), null);
  assert.equal(getScriptureAudioSource('Luther 1912'), null);
  assert.equal(getScriptureAudioSource('Diodati 1649'), null);
});
