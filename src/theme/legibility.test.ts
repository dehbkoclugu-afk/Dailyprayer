import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { themes, type ThemeColors } from './tokens.ts';
import { MIN_TEXT_SIZE, type } from './typography.ts';

/**
 * Guards roadmap item 32: the smallest text has to be readable, by size and by
 * contrast together.
 *
 * Both halves were failing. PLUS badges and the art credits were 10dp, below the
 * smallest size Material defines, and the eyebrows and tab labels were 11. And on
 * the light theme the brand gold measured 2.79:1 against `surfaceAlt` — so the
 * strings that were already the smallest were also the ones set in a colour that
 * did not reach the threshold for body text, let alone compensate for being small.
 * `inkFaint` failed too, in both themes, on the surface it is most used against.
 *
 * The contrast here is computed, not asserted from a table: WCAG 2.1 relative
 * luminance over the actual token values, so changing a hex re-runs the maths.
 *
 * Two exemptions, both narrow and both in the standard:
 *
 *  - Large text passes at 3:1. The devotional drop cap (64) and the plan day's
 *    quote mark (46) are single ornamental glyphs and keep the luminous brand
 *    gold; everything read as copy uses `goldText`.
 *  - Text over artwork is not a token pair and cannot be checked here. Those
 *    were measured against the rendered scrim instead, and roadmap item 50 covers
 *    them properly.
 */

/** WCAG 2.1 relative luminance. */
function luminance(hex: string): number {
  const clean = hex.replace('#', '');
  const channels = [0, 2, 4]
    .map((i) => parseInt(clean.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

/** WCAG AA for text below the large-text threshold. */
const AA_NORMAL = 4.5;
/** WCAG AA for text at or above 24px, or 18.66px bold. */
const AA_LARGE = 3;

/** Every colour a screen actually paints text on. */
const SURFACES: (keyof ThemeColors)[] = ['bg', 'surface', 'surfaceAlt', 'chrome'];
/** Every colour used as text that has to be read rather than admired. */
const TEXT_COLOURS: (keyof ThemeColors)[] = ['ink', 'inkSoft', 'inkFaint', 'goldText'];

test('the floor is above Material’s smallest label', () => {
  // Material's label-small is 11sp. The strings at this step are also uppercase,
  // tracked wide and often gold on artwork, so the size has to pay that back.
  assert.ok(MIN_TEXT_SIZE > 11, `floor of ${MIN_TEXT_SIZE} is not above label-small`);
});

test('no role in the scale is below the floor', () => {
  const offenders = Object.entries(type)
    .filter(([, style]) => style.fontSize < MIN_TEXT_SIZE)
    .map(([role, style]) => `${role}: ${style.fontSize}`);
  assert.deepEqual(offenders, [], `roles below ${MIN_TEXT_SIZE}dp:\n${offenders.join('\n')}`);
});

test('every readable text colour clears AA on every surface it can sit on', () => {
  const offenders: string[] = [];
  for (const [name, theme] of Object.entries(themes)) {
    for (const fg of TEXT_COLOURS) {
      for (const bg of SURFACES) {
        const ratio = contrast(theme[fg], theme[bg]);
        if (ratio < AA_NORMAL) {
          offenders.push(`${name}: ${fg} on ${bg} — ${ratio.toFixed(2)}:1`);
        }
      }
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `text colours below ${AA_NORMAL}:1:\n${offenders.join('\n')}`,
  );
});

test('the brand gold still clears the large-text threshold it is kept for', () => {
  // `gold` is exempt from AA_NORMAL because it is decoration and ornamental
  // display type — but an ornament nobody can see is not an ornament either.
  const offenders: string[] = [];
  for (const [name, theme] of Object.entries(themes)) {
    for (const bg of SURFACES) {
      const ratio = contrast(theme.gold, theme[bg]);
      if (ratio < AA_LARGE) offenders.push(`${name}: gold on ${bg} — ${ratio.toFixed(2)}:1`);
    }
  }
  assert.deepEqual(offenders, [], `decorative gold below ${AA_LARGE}:1:\n${offenders.join('\n')}`);
});

test('gold is only used as text where the type is large enough to be exempt', () => {
  // The rule this encodes: reading gold means goldText. The two ornaments are
  // named, so a third one cannot appear without saying so here.
  const EXEMPT = new Set(['app/devotional.tsx', 'app/plan/[id]/[day].tsx']);
  const offenders: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.tsx$/.test(entry)) {
        const source = readFileSync(path, 'utf8');
        for (const match of source.matchAll(/color:\s*t\.gold\b(?!Text|Soft)/g)) {
          const line = source.slice(0, match.index).split('\n').length;
          if (!EXEMPT.has(path)) offenders.push(`${path}:${line}`);
        }
      }
    }
  };
  for (const root of ['app', 'src']) walk(root);
  assert.deepEqual(
    offenders,
    [],
    `gold used as text outside the large-text exemption:\n${offenders.join('\n')}\n` +
      'Use t.goldText — t.gold does not reach 4.5:1 on the light theme.',
  );
});

test('the two exempt ornaments really are large display type', () => {
  // The exemption is size-based, so it has to be checked against the size.
  assert.ok(type.dropCap.fontSize >= 24, 'the drop cap is no longer large text');
  assert.ok(type.pullQuote.fontSize >= 24, 'the pull quote is no longer large text');
});

test('the licence credit is not set in the smallest type available', () => {
  // CC BY-ND 4.0 and CC BY 4.0 both require the credit to travel with the extract.
  // It sat at the old floor behind a 0.65 veil — the least legible string on the
  // card, carrying the strongest obligation on it.
  const source = readFileSync('src/components/VerseCard.tsx', 'utf8');
  const credit = source.slice(source.search(/required attribution/i));
  const role = credit.match(/\.\.\.type\.(\w+)/)?.[1] as keyof typeof type | undefined;
  assert.ok(role, 'the credit no longer uses a type role');
  assert.ok(
    type[role].fontSize > MIN_TEXT_SIZE,
    `the credit is at ${type[role].fontSize}dp, the floor for incidental text`,
  );
  const alpha = Number(credit.match(/rgba\(242,238,230,([\d.]+)\)/)?.[1] ?? 1);
  assert.ok(alpha >= 0.85, `the credit is veiled at ${alpha} opacity`);
});
