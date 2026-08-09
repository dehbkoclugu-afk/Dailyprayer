import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

/**
 * Guards roadmap item 48: auto-advance assumes a sighted reader who can see
 * the next line arrive. A screen-reader user is often still partway through
 * hearing the current one — TalkBack/VoiceOver's reading pace has nothing
 * to do with the player's own `PACE_FACTOR` timer — so the screen must not
 * move on its own once a screen reader is active; resuming has to be an
 * explicit tap.
 */

const source = readFileSync('app/player.tsx', 'utf8');

test('a detected screen reader pauses the player, once on mount and again on any live toggle', () => {
  assert.match(source, /AccessibilityInfo\.isScreenReaderEnabled\(\)\.then\(\(enabled\) => \{/);
  assert.match(source, /if \(!cancelled && enabled\) setPaused\(true\);/);
  assert.match(
    source,
    /addEventListener\('screenReaderChanged', \(enabled: boolean\) => \{\s*\n\s*if \(enabled\) setPaused\(true\);/,
  );
});

test('turning the screen reader back off never auto-resumes the player', () => {
  // Only `setPaused(true)` may appear in this effect — no branch that calls
  // setPaused(false) when `enabled` is false, which would silently restart
  // auto-advance out from under a user who paused deliberately.
  const block = source.match(/\/\/ Auto-advance assumes[\s\S]*?\n {2}\}, \[\]\);/);
  assert.ok(block, 'expected the screen-reader detection effect');
  assert.doesNotMatch(block[0], /setPaused\(false\)/);
});

test('the auto-advance timer still respects `paused`, so the detection above actually stops it', () => {
  assert.match(source, /if \(paused \|\| lastLine\) return;/);
});
