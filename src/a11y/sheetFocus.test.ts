import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

/**
 * Guards roadmap item 28: a bottom sheet has to take screen-reader focus when it
 * opens, hold it, and give it back when it closes.
 *
 * None of the three happened. A sheet would slide up while TalkBack stayed on the
 * control that opened it — now underneath the sheet — so the sheet had to be found
 * by swiping, with no announcement that anything had opened.
 *
 * Containment was half done, and by a mechanism worth naming precisely.
 * `accessibilityViewIsModal` is **iOS-only**; on Android, RN's `Modal` is a
 * `Dialog` in its own window, which TalkBack cannot traverse out of. So the prop
 * is the iOS half and the Modal is the Android half — a note in the reader's
 * picker (item 23) claimed the prop was what kept TalkBack in, which was wrong
 * for the platform TalkBack actually runs on.
 */

/** Every component that renders a `<Modal>` is a sheet for this purpose. */
function sheets(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.tsx$/.test(entry) && /<Modal\b/.test(readFileSync(path, 'utf8'))) out.push(path);
    }
  };
  for (const root of ['app', 'src']) walk(root);
  return out.sort();
}

test('every sheet is found', () => {
  // If a sheet stops matching, the rules below would pass by not looking at it.
  assert.deepEqual(sheets(), [
    'app/read.tsx',
    'src/components/DataActionSheet.tsx',
    'src/components/OptionSheet.tsx',
    'src/components/ReadingSettingsSheet.tsx',
    'src/components/ReminderTimeSheet.tsx',
    'src/components/VerseActionSheet.tsx',
  ]);
});

test('every sheet contains VoiceOver on iOS', () => {
  const offenders = sheets().filter(
    (file) => !/accessibilityViewIsModal/.test(readFileSync(file, 'utf8')),
  );
  assert.deepEqual(
    offenders,
    [],
    `sheets VoiceOver can walk out of:\n${offenders.join('\n')}\n` +
      'Android is covered by Modal being its own window; iOS needs the prop.',
  );
});

test('every sheet moves focus to its title', () => {
  const offenders = sheets().filter(
    (file) => !/useSheetTitleFocus\(/.test(readFileSync(file, 'utf8')),
  );
  assert.deepEqual(offenders, [], `sheets that open behind the reader's focus:\n${offenders.join('\n')}`);
});

test('a title that takes focus is a heading', () => {
  // Landing on a title is only useful if it announces itself as one.
  const offenders: string[] = [];
  for (const file of sheets()) {
    const source = readFileSync(file, 'utf8');
    for (const [, after] of source.matchAll(/ref=\{(?:\w*[Tt]itleRef)\}([\s\S]{0,160})/g)) {
      if (!/accessibilityRole="header"/.test(after)) offenders.push(file);
    }
  }
  assert.deepEqual(offenders, [], `focus targets that are not headings:\n${offenders.join('\n')}`);
});

test('a sheet backdrop is not an accessibility element', () => {
  // Roadmap item 29. The dim area dismisses on tap but has nothing to announce;
  // leaving it focusable puts an unnamed control between the reader and the sheet
  // — the modal semantics already cover dismissal, so it should not also appear
  // as a "Close" button nobody labelled.
  const offenders: string[] = [];
  for (const file of sheets()) {
    const source = readFileSync(file, 'utf8');
    // Every dismiss-on-tap surface, whether it wraps the sheet or sits beside it.
    for (const [block] of source.matchAll(/<Pressable\b[\s\S]*?(?:\/>|>)/g)) {
      const dismisses = /onPress=\{onClose\}|onPress=\{\(\) => set\w+\(null\)\}/.test(block);
      const fullBleed = /flex: 1/.test(block);
      if (!dismisses || !fullBleed) continue;
      if (!/importantForAccessibility="no"/.test(block)) {
        offenders.push(`${file}: ${block.replace(/\s+/g, ' ').slice(0, 70)}`);
      }
    }
  }
  assert.deepEqual(offenders, [], `focusable backdrops:\n${offenders.join('\n')}`);
});

test('nothing in a sheet exists only to swallow a tap', () => {
  // A `<Pressable onPress={() => {}}>` wrapped around a sheet's content to stop
  // taps reaching the backdrop is an unnamed control around everything — and it
  // is only needed when the backdrop is the parent. With the backdrop as a
  // sibling it disappears (roadmap item 29).
  const offenders: string[] = [];
  for (const file of sheets()) {
    const source = readFileSync(file, 'utf8');
    if (/onPress=\{\(\) => \{\}\}/.test(source)) offenders.push(file);
  }
  assert.deepEqual(offenders, [], `no-op Pressables wrapping sheet content:\n${offenders.join('\n')}`);
});

test('setting focus does not throw where there is no focus to set', () => {
  // `findNodeHandle` throws on web rather than returning null, so every sheet
  // open raised an uncaught exception in the browser harness — which is the thing
  // that surfaces real errors, so a permanent one there is expensive.
  const source = readFileSync(join('src', 'a11y', 'sheetFocus.ts'), 'utf8');
  const guard = source.indexOf("Platform.OS === 'web'");
  const call = source.indexOf('findNodeHandle(node)');
  assert.ok(guard !== -1, 'the web path must bail out');
  assert.ok(guard < call, 'and it must bail out before calling findNodeHandle');
});

test('closing a sheet gives focus back to what opened it', () => {
  // Otherwise focus lands at the top of the screen and the reader has to swipe
  // back to where they were.
  const triggers: [string, number][] = [
    ['app/read.tsx', 2], // the passage picker and the reading settings
    ['app/(tabs)/profile.tsx', 4], // appearance, language, restart, delete (roadmap item 40)
  ];
  for (const [file, count] of triggers) {
    const source = readFileSync(file, 'utf8');
    const uses = [...source.matchAll(/useTriggerFocus\(/g)];
    assert.equal(uses.length, count, `${file} should return focus for ${count} sheets`);
  }
});
