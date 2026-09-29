import assert from 'node:assert/strict';
import test from 'node:test';
import { buildScriptureSearchIndex, getScriptureSearchIndex, searchScriptureIndex } from './scriptureSearch.ts';
import type { FullBook } from '@/data/bibleFull';

const bible: FullBook[] = [{
  code: 'GEN',
  name: 'Genesis',
  chapters: [[['1', 'In the beginning God created the heavens and the earth.'], ['2', 'The earth was formless.']]],
}, {
  code: 'MAT',
  name: 'Matthew',
  chapters: [[['1', 'The book of the genealogy of Jesus Christ.']]],
}];

test('build yields between chapters and preserves exact Scripture in hits', async () => {
  let yields = 0;
  const index = await buildScriptureSearchIndex(bible, 'en', async () => { yields += 1; });
  const hits = searchScriptureIndex(index, 'beginning');
  assert.equal(yields, 2);
  assert.equal(hits.length, 1);
  assert.equal(hits[0].text, bible[0].chapters[0][0][1]);
  assert.equal(hits[0].ref, 'Genesis 1:1');
});

test('search uses an exact substring after indexed candidate selection and filters books', async () => {
  const index = await buildScriptureSearchIndex(bible, 'en', async () => {});
  assert.equal(searchScriptureIndex(index, 'earth').length, 2);
  assert.equal(searchScriptureIndex(index, 'earth', { includesBook: (book) => book === 1 }).length, 0);
  assert.deepEqual(searchScriptureIndex(index, 'x'), []);
});

test('screen visits share one locale-scoped index promise', () => {
  assert.equal(getScriptureSearchIndex(bible, 'en'), getScriptureSearchIndex(bible, 'en'));
  assert.notEqual(getScriptureSearchIndex(bible, 'en'), getScriptureSearchIndex(bible, 'tr'));
});
