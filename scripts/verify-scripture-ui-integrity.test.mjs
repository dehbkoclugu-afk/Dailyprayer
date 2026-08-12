import assert from 'node:assert/strict';
import test from 'node:test';
import { findForbiddenScriptureUi } from './verify-scripture-ui-integrity.mjs';

test('blocks Scripture transformation affordances', () => {
  assert.equal(findForbiddenScriptureUi("label: 'Summarize this verse'").length, 1);
  assert.equal(findForbiddenScriptureUi("tr('verse.translate')").length, 1);
  assert.equal(findForbiddenScriptureUi("label: 'Simplify'").length, 1);
});

test('allows exact-text preservation actions', () => {
  const content = "copy share bookmark highlight saveJournal";
  assert.deepEqual(findForbiddenScriptureUi(content), []);
});
