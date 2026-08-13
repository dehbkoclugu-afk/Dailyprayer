import assert from 'node:assert/strict';
import test from 'node:test';
import { filterIncludesBook, newTestamentStart, searchSnippet, testamentLabels } from './scriptureNavigation.ts';

test('testament and book filters follow canonical Matthew boundary', () => {
  const split = newTestamentStart(['GEN', 'EXO', 'MAT', 'MRK']);
  assert.equal(split, 2);
  assert.equal(filterIncludesBook('old', 1, split), true);
  assert.equal(filterIncludesBook('new', 2, split), true);
  assert.equal(filterIncludesBook('book:3', 3, split), true);
  assert.equal(filterIncludesBook('book:3', 2, split), false);
  assert.deepEqual(testamentLabels('tr'), ['Eski Ahit', 'Yeni Ahit']);
});

test('search snippet bounds both sides while preserving only the matched range', () => {
  const text = `${'a'.repeat(80)}needle${'b'.repeat(80)}`;
  const snippet = searchSnippet(text, 80, 6, 20);
  assert.equal(snippet.pre, `…${'a'.repeat(20)}`);
  assert.equal(snippet.match, 'needle');
  assert.equal(snippet.post, `${'b'.repeat(20)}…`);
});
