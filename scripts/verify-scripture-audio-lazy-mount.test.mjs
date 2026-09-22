import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('the Bible reader does not mount the native audio player before Listen is pressed', async () => {
  const source = await readFile(new URL('../src/components/ScriptureAudioBible.tsx', import.meta.url), 'utf8');
  const publicComponent = source.indexOf('export function ScriptureAudioBible');
  const activeComponent = source.indexOf('function ActiveScriptureAudio');
  const audioHook = source.indexOf('const player = useAudioPlayer');

  assert.ok(publicComponent >= 0);
  assert.ok(activeComponent > publicComponent);
  assert.ok(source.slice(publicComponent, activeComponent).includes('if (!activated)'));
  assert.ok(source.slice(publicComponent, activeComponent).includes('setActivated(true)'));
  assert.ok(audioHook > activeComponent, 'native audio hook must stay inside the lazily mounted child');
});

test('the audio player uses artwork and complete media controls', async () => {
  const source = await readFile(new URL('../src/components/ScriptureAudioBible.tsx', import.meta.url), 'utf8');

  assert.match(source, /<ArtSlot id="A18-ritual-reading"/);
  assert.match(source, /accessibilityRole="adjustable"/);
  assert.match(source, /onResponderMove=\{seekFromGesture\}/);
  assert.match(source, />−15<\/Text>/);
  assert.match(source, />\+15<\/Text>/);
  assert.match(source, /RATES\.map/);
  assert.match(source, /formatTime\(status\.currentTime\)/);
  assert.match(source, /request !== requestVersion\.current/);
  assert.match(source, /requestVersion\.current \+= 1/);
});

test('playback speed preserves speech pitch and avoids destructive rate extremes', async () => {
  const source = await readFile(new URL('../src/components/ScriptureAudioBible.tsx', import.meta.url), 'utf8');

  assert.match(source, /const RATES = \[0\.85, 1, 1\.15\] as const/);
  assert.match(source, /const PITCH_CORRECTION_QUALITY = 'high' as const/);
  assert.equal(
    source.match(/setPlaybackRate\([^\n]+PITCH_CORRECTION_QUALITY\)/g)?.length,
    2,
    'initial load and live speed changes must both enable high-quality pitch correction',
  );
});
