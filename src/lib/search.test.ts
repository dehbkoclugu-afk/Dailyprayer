import assert from 'node:assert/strict';
import test from 'node:test';
import { findMatch, foldForSearch, minimumQueryLength } from './search.ts';

const match = (text: string, query: string, locale: string) => {
  const span = findMatch(text, foldForSearch(text, locale), foldForSearch(query, locale), locale);
  return span ? text.slice(span.start, span.end) : null;
};

test('matches regardless of case, accents and Turkish dotted/dotless i', () => {
  assert.equal(match('Ve İsa dedi ki', 'isa', 'tr'), 'İsa');
  assert.equal(match('Ve İsa dedi ki', 'Isa', 'tr'), 'İsa');
  assert.equal(match('el corazón alegre', 'corazon', 'es'), 'corazón');
  assert.equal(match('Größe und Kraft', 'grosse', 'de'), 'Größe');
  assert.equal(match('nothing here', 'grace', 'en'), null);
});

test('highlight span maps back to the original text after length-changing folds', () => {
  assert.equal(match('İİİ Tanrı sevgidir', 'tanri', 'en'), 'Tanrı');
});

test('CJK queries may be a single character', () => {
  assert.equal(minimumQueryLength('爱'), 1);
  assert.equal(minimumQueryLength('a'), 2);
});
