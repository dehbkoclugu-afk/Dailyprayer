import assert from 'node:assert/strict';
import test from 'node:test';
import { elevation, grainOpacity, interaction, themes } from './tokens.ts';
import { artworkScrims } from './artContrast.ts';
import { resolveMotionPattern } from './motion.ts';

test('Dawn grain is lighter than Vigil grain', () => {
  assert.ok(grainOpacity.dawn < grainOpacity.vigil);
  assert.ok(grainOpacity.dawn >= 0.01);
});

test('surface hierarchy increases monotonically', () => {
  assert.ok(elevation.card.elevation < elevation.hero.elevation);
  assert.ok(elevation.hero.elevation < elevation.floating.elevation);
});

test('semantic visual roles are complete', () => {
  for (const theme of Object.values(themes)) {
    assert.ok(theme.onArtwork);
    assert.ok(theme.onArtworkMuted);
    assert.ok(theme.sacredGold);
    assert.ok(theme.focusRing);
  }
  assert.deepEqual(Object.keys(artworkScrims), ['soft', 'readable', 'strong']);
  assert.ok(interaction.disabledOpacity < interaction.pressedOpacity);
});

test('Reduce Motion removes spatial transforms', () => {
  assert.equal(resolveMotionPattern('sharedAxis', true).animation, 'none');
  assert.equal(resolveMotionPattern('fadeThrough', true).animation, 'fade');
  assert.equal(resolveMotionPattern('container', true).animation, 'fade');
});
