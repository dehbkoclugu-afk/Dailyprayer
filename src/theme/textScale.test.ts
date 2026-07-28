import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { CHROME_SCALE_CAP, isStacked, scaleHeight, STACK_SCALE } from './textScale.logic.ts';

/**
 * Guards roadmap item 30: a box that holds text must not have a height the text
 * can outgrow.
 *
 * React Native applies the OS text-size setting to every `<Text>` on its own, so
 * the text grows whether or not the layout is ready for it. A `height: 320` card
 * does not grow with it, and at 200% the verse card lost its reference and its
 * licence credit off the bottom edge — the credit being a term of the CC BY-ND
 * and CC BY licences the app ships under, so this was a rights problem as well
 * as a legibility one.
 *
 * The rule is structural and readable from source: if an element declares a
 * numeric `height` and its own markup contains a `<Text>`, the number is a
 * clipping bound. Heights that come from `useScaledHeight` are fine — that is
 * the helper that grows them.
 *
 * What this cannot see is whether the grown box is *enough*, and unlike the tap
 * targets that gap cannot be closed in a browser: react-native-web reports a
 * `fontScale` of 1 whatever the OS is set to, so the rendered web build shows the
 * default size and nothing else. Forcing the font size up in the page would
 * measure a different thing — text growing without React re-rendering, which is
 * not what happens on a device.
 *
 * So this rests on the source guard plus a device check at go-live, the same
 * arrangement already used for `accessibilityState` and `accessibilityActions`,
 * which react-native-web also does not implement.
 */

const ROOTS = ['app', 'src'];

function sourceFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.tsx$/.test(entry)) out.push(path);
    }
  };
  for (const root of ROOTS) walk(root);
  return out;
}

/** Where an opening tag ends: the first `>` outside a braced expression. */
function openingTagEnd(source: string, from: number): { end: number; selfClosing: boolean } {
  let depth = 0;
  for (let i = from; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === '{') depth += 1;
    else if (ch === '}') depth -= 1;
    else if (ch === '>' && depth === 0) return { end: i, selfClosing: source[i - 1] === '/' };
  }
  return { end: -1, selfClosing: false };
}

interface Element {
  tag: string;
  /** Opening tag plus children, minus any nested element of the same kind. */
  own: string;
  line: number;
}

function elements(source: string, name: string): Element[] {
  const found: Element[] = [];
  const re = new RegExp(`</?${name}\\b`, 'g');
  const open: { start: number; bodyStart: number; nested: [number, number][] }[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(source))) {
    if (match[0].startsWith('</')) {
      const frame = open.pop();
      if (!frame) continue;
      const end = match.index + `</${name}>`.length;
      const tag = source.slice(frame.start, frame.bodyStart - 1);
      let own = tag;
      let cursor = frame.bodyStart;
      for (const [from, to] of frame.nested) {
        own += source.slice(cursor, from);
        cursor = to;
      }
      own += source.slice(cursor, match.index);
      found.push({ tag, own, line: source.slice(0, frame.start).split('\n').length });
      open.at(-1)?.nested.push([frame.start, end]);
      continue;
    }
    const { end, selfClosing } = openingTagEnd(source, match.index);
    if (end === -1) continue;
    const tag = source.slice(match.index, end);
    if (selfClosing) {
      found.push({ tag, own: tag, line: source.slice(0, match.index).split('\n').length });
      open.at(-1)?.nested.push([match.index, end + 1]);
      continue;
    }
    open.push({ start: match.index, bodyStart: end + 1, nested: [] });
  }
  return found;
}

/**
 * A `height` that is a bound on layout — not a shadow offset, not a hairline
 * rule, not a percentage fill, not a decorative bar.
 *
 * `height: '100%'` and `height: 4` are excluded deliberately: the first grows
 * with its parent by definition, and the second is a sheet's grab handle or a
 * progress track, which holds no text and would only get thicker.
 */
const DECORATIVE_MAX = 8;

function clippingHeights(tag: string): number[] {
  const withoutShadow = tag.replace(/shadowOffset:\s*\{[^}]*\}/g, '');
  const out: number[] = [];
  for (const [, value] of withoutShadow.matchAll(/\bheight:\s*(\d+)\b/g)) {
    const n = Number(value);
    if (n > DECORATIVE_MAX) out.push(n);
  }
  return out;
}

test('the chrome cap grows the bar without letting it take the screen', () => {
  // Below 1 it would shrink chrome that never asked to shrink; above ~1.5 a tab
  // bar at 200% takes a third of a phone away from the content it labels.
  assert.ok(CHROME_SCALE_CAP > 1 && CHROME_SCALE_CAP <= 1.5, `cap out of range: ${CHROME_SCALE_CAP}`);
});

test('the stacking threshold sits below the largest OS setting', () => {
  // A threshold at or above 2 would never fire on a device set to 200%, which is
  // the exact case it exists for.
  assert.ok(STACK_SCALE > 1 && STACK_SCALE < 2, `threshold out of range: ${STACK_SCALE}`);
});

test('a box grows with the text and never shrinks below its design height', () => {
  assert.equal(scaleHeight(320, 1), 320);
  assert.equal(scaleHeight(320, 2), 640);
  // A reader who made text smaller did not ask for a smaller card.
  assert.equal(scaleHeight(320, 0.85), 320);
  // The cap is a ceiling on growth, not on the base.
  assert.equal(scaleHeight(84, 2, CHROME_SCALE_CAP), 118);
  // The platform not telling us is not a reason to guess high.
  assert.equal(scaleHeight(320, Number.NaN), 320);
});

test('stacking fires at the threshold and above, including 200%', () => {
  assert.equal(isStacked(1), false);
  assert.equal(isStacked(STACK_SCALE), true);
  assert.equal(isStacked(2), true);
  assert.equal(isStacked(Number.NaN), false);
});

test('no box wrapping text pins a height the text can outgrow', () => {
  const offenders: string[] = [];
  for (const file of sourceFiles()) {
    if (/\.test\.tsx$/.test(file)) continue;
    const source = readFileSync(file, 'utf8');
    for (const name of ['View', 'Pressable']) {
      for (const { tag, own, line } of elements(source, name)) {
        if (!/<Text\b/.test(own)) continue;
        for (const height of clippingHeights(tag)) {
          offenders.push(`${file}:${line} height: ${height}`);
        }
      }
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `fixed heights on boxes containing text:\n${offenders.join('\n')}\n` +
      'Use useScaledHeight() from @/theme/textScale so the box grows with the reader’s text size.',
  );
});

test('art with text laid over it grows, bare art does not', () => {
  // ArtSlot is the shared hero frame; the distinction lives in one place so a new
  // hero cannot reintroduce the paywall's clipped benefit list.
  const source = readFileSync('src/components/ArtSlot.tsx', 'utf8');
  assert.match(source, /useScaledHeight\(height\)/, 'ArtSlot no longer scales its height');
  assert.match(
    source,
    /children\s*\?\s*scaled\s*:\s*height/,
    'ArtSlot should scale only when content is laid over the art',
  );
});

test('the verse card and the tab bar are scaled by name', () => {
  // Both were the reported cases, and both are the kind of surface a refactor
  // quietly flattens back to a literal.
  const card = readFileSync('src/components/VerseCard.tsx', 'utf8');
  assert.match(card, /useScaledHeight\(320\)/, 'the verse card hero is no longer scaled');

  const tabs = readFileSync('app/(tabs)/_layout.tsx', 'utf8');
  assert.match(
    tabs,
    /useScaledHeight\(84,\s*CHROME_SCALE_CAP\)/,
    'the tab bar should grow, capped as chrome',
  );
});
