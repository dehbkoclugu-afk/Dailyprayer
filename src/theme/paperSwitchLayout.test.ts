import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

/**
 * Guards roadmap item 46 (partial — see docs/design-100.md for what's left
 * open): the reader's "paper tone" row is a custom `Pressable` standing in
 * for a Material switch, not the platform's own `Switch`, so nothing forces
 * it to behave like one — three things had to be checked and, where wrong,
 * fixed by hand.
 *
 * **Large-text layout** was the one actual bug: the label's container had
 * no `flex`/`minWidth: 0`, so at a large system font size the label had no
 * width to wrap into and would overflow past the switch instead of wrapping
 * under it — a flexbox row's child does not shrink below its own intrinsic
 * (unwrapped) width unless told to.
 *
 * **Checked state** (`accessibilityRole="switch"` + `accessibilityState={{
 * checked }}`) was already the correct, standard RN API — this is what the
 * *native* accessibility bridge reads to tell TalkBack/VoiceOver "switch,
 * on" or "off". It doesn't reach `aria-checked` in the react-native-web
 * verification harness (confirmed empirically: `aria-checked` stayed `null`
 * before and after toggling in a browser build) — but RNW never wires any
 * `accessibilityState` sub-property to an ARIA attribute for any component
 * in this app, checked included, so that's this session's now-familiar
 * native-works/browser-can't-see-it gap, not a code defect to fix here.
 */

const source = readFileSync('src/components/ReadingSettingsSheet.tsx', 'utf8');

test('the paper-tone label can wrap instead of overflowing at large text sizes', () => {
  assert.match(source, /flex: 1, minWidth: 0, flexDirection: 'row'/);
  assert.match(source, /color: t\.ink, flexShrink: 1/);
  assert.match(source, /flexShrink: 0,\s*\n\s*width: 46,/);
});

test('the switch still declares the correct role and checked state', () => {
  assert.match(source, /accessibilityRole="switch"/);
  assert.match(source, /accessibilityState=\{\{ checked: paper \}\}/);
});
