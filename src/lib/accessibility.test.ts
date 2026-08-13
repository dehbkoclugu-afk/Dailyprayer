import assert from 'node:assert/strict';
import test from 'node:test';
import {
  accessibleVerseLabel,
  categoryChipOffset,
  shouldAutoAdvancePrayer,
} from './accessibility.ts';

test('verse accessibility combines reference and text once', () => {
  assert.equal(accessibleVerseLabel('John 3:16', 'For God so loved the world'), 'John 3:16. For God so loved the world');
});

test('prayer auto-advance waits for accessibility detection and stops for screen readers', () => {
  assert.equal(shouldAutoAdvancePrayer(false, false, null), false);
  assert.equal(shouldAutoAdvancePrayer(false, false, true), false);
  assert.equal(shouldAutoAdvancePrayer(false, false, false), true);
  assert.equal(shouldAutoAdvancePrayer(true, false, false), false);
  assert.equal(shouldAutoAdvancePrayer(false, true, false), false);
});

test('category chip offset never scrolls before the list start', () => {
  assert.equal(categoryChipOffset(0), 0);
  assert.equal(categoryChipOffset(3), 312);
});
