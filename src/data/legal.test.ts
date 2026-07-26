import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { TERMS_OF_SERVICE } from './legal.ts';

const editions = [
  'Yorumsuz Türkçe Çeviri',
  'World English Bible',
  'Reina-Valera 1909',
  'Bíblia Livre',
  'La Sainte Bible \\(Ostervald\\)',
  'Luther Bible 1912',
];
const sourceUrls = [
  'https://ebible.org/turytc/copyright.htm',
  'https://github.com/seven1m/open-bibles/blob/master/eng-web.usfx.xml',
  'https://github.com/seven1m/open-bibles/blob/master/spa-rv1909.usfx.xml',
  'https://ebible.org/porbr2018/copyright.htm',
  'https://ebible.org/fra_fob/copyright.htm',
  'https://github.com/seven1m/open-bibles/blob/master/deu-luther1912.osis.xml',
];

test('Terms disclose all six Scripture editions and sensitive rights limits', () => {
  for (const edition of editions) assert.match(TERMS_OF_SERVICE, new RegExp(edition));
  assert.match(TERMS_OF_SERVICE, /© 2023-2025 İsmail\s+Serinken and eBible\.org/);
  assert.match(TERMS_OF_SERVICE, /CC BY-ND 4\.0/);
  assert.match(TERMS_OF_SERVICE, /https:\/\/ebible\.org\/turytc\/copyright\.htm/);
  for (const sourceUrl of sourceUrls) assert.ok(TERMS_OF_SERVICE.includes(sourceUrl));
  assert.doesNotMatch(TERMS_OF_SERVICE, /All Scripture.*public domain/i);
});

test('Terms state the Portuguese license Lumen must comply with', () => {
  // Bíblia Livre is CC BY 4.0, not public domain — attribution is a condition.
  assert.match(TERMS_OF_SERVICE, /Bíblia Livre:\*\* copyright © 2018 Diego Santos/);
  assert.match(TERMS_OF_SERVICE, /CC BY 4\.0/);
  assert.match(TERMS_OF_SERVICE, /creativecommons\.org\/licenses\/by\/4\.0/);
});

test('Terms no longer carry the editions that failed rights verification', () => {
  // Ostervald 1996 and the unidentified Almeida were replaced (roadmap item 10).
  for (const rejected of [
    /Ostervald 1996/,
    /fra-ostervald\.osis\.xml/,
    /por-almeida\.usfx\.xml/,
  ]) {
    assert.doesNotMatch(TERMS_OF_SERVICE, rejected);
  }
});

test('hosted Terms mirror the Scripture disclosure', () => {
  const hosted = readFileSync('docs/legal/terms-of-service.md', 'utf8');
  for (const edition of editions) assert.match(hosted, new RegExp(edition));
});
