import assert from 'node:assert/strict';
import test from 'node:test';
import { contentMaxWidth, isExpandedLayout } from './adaptiveLayout.ts';

test('expanded layout begins at the navigation rail breakpoint', () => {
  assert.equal(isExpandedLayout(839), false);
  assert.equal(isExpandedLayout(840), true);
  assert.equal(contentMaxWidth(600), 480);
  assert.equal(contentMaxWidth(1024), 1120);
});
