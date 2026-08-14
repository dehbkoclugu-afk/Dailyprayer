import assert from 'node:assert/strict';
import test from 'node:test';
import {
  contentMaxWidth,
  expandedPaneWidth,
  foldablePaneGap,
  isExpandedLayout,
  isShortLayout,
} from './adaptiveLayout.ts';

test('expanded layout begins at the navigation rail breakpoint', () => {
  assert.equal(isExpandedLayout(839), false);
  assert.equal(isExpandedLayout(840), true);
  assert.equal(contentMaxWidth(600), 480);
  assert.equal(contentMaxWidth(1024), 1120);
});

test('short windows and large text reflow instead of clipping fixed compositions', () => {
  assert.equal(isShortLayout(619), true);
  assert.equal(isShortLayout(700), false);
  assert.equal(isShortLayout(700, 1.3), true);
});

test('expanded panes reserve a foldable-safe centre gutter', () => {
  assert.equal(foldablePaneGap(800), 0);
  assert.equal(foldablePaneGap(1000), 40);
  assert.equal(expandedPaneWidth(1000), 480);
  assert.ok(expandedPaneWidth(1400) < 700);
});
