import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { TERMS_OF_SERVICE } from './legal.ts';

const editions = [
  'Yorumsuz Türkçe Çeviri',
  'World English Bible',
  'Reina-Valera 1909',
  'João Ferreira de Almeida',
  'Ostervald 1996',
  'Luther Bible 1912',
];
const sourceFiles = [
  'eng-web.usfx.xml',
  'spa-rv1909.usfx.xml',
  'por-almeida.usfx.xml',
  'fra-ostervald.osis.xml',
  'deu-luther1912.osis.xml',
];

test('Terms disclose all six Scripture editions and sensitive rights limits', () => {
  for (const edition of editions) assert.match(TERMS_OF_SERVICE, new RegExp(edition));
  assert.match(TERMS_OF_SERVICE, /© 2023-2025 İsmail\s+Serinken and eBible\.org/);
  assert.match(TERMS_OF_SERVICE, /CC BY-ND 4\.0/);
  assert.match(TERMS_OF_SERVICE, /https:\/\/ebible\.org\/turytc\/copyright\.htm/);
  for (const sourceFile of sourceFiles) assert.ok(TERMS_OF_SERVICE.includes(sourceFile));
  assert.match(TERMS_OF_SERVICE, /independent rights verification is\s+pending/);
  assert.doesNotMatch(TERMS_OF_SERVICE, /All Scripture.*public domain/i);
});

test('hosted Terms mirror the Scripture disclosure', () => {
  const hosted = readFileSync('docs/legal/terms-of-service.md', 'utf8');
  for (const edition of editions) assert.match(hosted, new RegExp(edition));
});
