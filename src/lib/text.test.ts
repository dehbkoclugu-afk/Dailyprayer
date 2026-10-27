import assert from 'node:assert/strict';
import test from 'node:test';
import { splitDropCap, truncate } from './text.ts';

test('drop cap skips opening quotes and keeps graphemes whole', () => {
  assert.deepEqual(splitDropCap('“In the beginning'), { lead: '“', cap: 'I', rest: 'n the beginning' });
  assert.deepEqual(splitDropCap('𝔄bc'), { lead: '', cap: '𝔄', rest: 'bc' });
  assert.deepEqual(splitDropCap('était'), { lead: '', cap: 'é', rest: 'tait' });
  assert.deepEqual(splitDropCap(''), { lead: '', cap: '', rest: '' });
});

test('truncate counts code points', () => {
  assert.equal(truncate('abc', 5), 'abc');
  assert.equal(truncate('abcdef', 3), 'abc…');
  assert.equal(truncate('😀😀😀', 2), '😀😀…');
});
