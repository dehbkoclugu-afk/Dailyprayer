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
