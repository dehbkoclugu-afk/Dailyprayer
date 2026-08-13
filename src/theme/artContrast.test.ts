import assert from 'node:assert/strict';
import test from 'node:test';
import { artContrast, contrastRatio, worstCaseScrimBackground } from './artContrast.ts';

test('art scrim guarantees WCAG AA against the brightest possible image pixel', () => {
  const worstBackground = worstCaseScrimBackground();
  assert.ok(contrastRatio([247, 241, 231], worstBackground) >= 4.5);
  assert.ok(contrastRatio([232, 228, 220], worstBackground) >= 4.5);
  assert.equal(artContrast.scrim, 'rgba(0,0,0,0.64)');
});
