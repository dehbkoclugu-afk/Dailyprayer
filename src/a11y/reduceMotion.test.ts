import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

/**
 * Guards roadmap items 36 and 37: every animation in the app respects the
 * system's reduced-motion setting, and does so *visibly in its own source*
 * rather than by silent inheritance from a library default.
 *
 * Reanimated's `withTiming`/`withSpring`/`withRepeat` and every layout-animation
 * builder (`FadeIn`, `ZoomIn`, …) already default to `ReduceMotion.System` —
 * confirmed empirically: in a browser with reduced motion emulated,
 * `ToastHost`'s `FadeInDown`/`FadeOutUp` render with zero animated frames
 * instead of sliding. Nothing in the app opts out with `ReduceMotion.Never`, so
 * every animation was arguably already correct.
 *
 * "Arguably" is the problem. Two of five animated files (`player.tsx`,
 * `StreakFlame.tsx`) already said so explicitly; the other three
 * (`ProgressRing.tsx`, `ToastHost.tsx`, `RitualCard.tsx`'s shimmer) relied on
 * that fact with nothing in their own source saying so — a silent dependency on
 * a third-party default that a future edit, or a future Reanimated version,
 * could break without anything here noticing. All five now declare it locally.
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

/** Files with an `entering=`/`exiting=`/`withRepeat(`/`withTiming(`/`withSpring(` call. */
function animatedFiles(): string[] {
  return sourceFiles().filter((file) => {
    const source = readFileSync(file, 'utf8');
    return /\bentering=|\bexiting=|\bwithRepeat\(|\bwithTiming\(|\bwithSpring\(/.test(source);
  });
}

test('the known set of animated files is unchanged', () => {
  // If this list grows, the new file needs its own reduce-motion story before
  // it's added here — that's the whole point of the next test.
  assert.deepEqual(animatedFiles().sort(), [
    'app/player.tsx',
    'src/components/ProgressRing.tsx',
    'src/components/RitualCard.tsx',
    'src/components/StreakFlame.tsx',
    'src/components/ToastHost.tsx',
  ]);
});

test('every animated file declares its own reduce-motion handling', () => {
  const offenders = animatedFiles().filter((file) => {
    const source = readFileSync(file, 'utf8');
    return !/useReducedMotion\(\)|isReduceMotionEnabled\(\)|ReduceMotion\.System|ReduceMotion\.Always/.test(
      source,
    );
  });
  assert.deepEqual(
    offenders,
    [],
    `animated file with no local reduce-motion declaration:\n${offenders.join('\n')}`,
  );
});

test('nothing opts out of the system setting', () => {
  const offenders = sourceFiles().filter((file) => /ReduceMotion\.Never/.test(readFileSync(file, 'utf8')));
  assert.deepEqual(offenders, [], `ReduceMotion.Never found in:\n${offenders.join('\n')}`);
});

test('ProgressRing and ToastHost gate their entering/exiting on it, not just declare it', () => {
  // Roadmap item 35 names these two specifically. Declaring `useReducedMotion()`
  // without using it in the ternary would pass the test above and still animate.
  const ring = readFileSync(join('src', 'components', 'ProgressRing.tsx'), 'utf8');
  assert.match(ring, /entering=\{filled && !reduceMotion \? ZoomIn/);

  const toast = readFileSync(join('src', 'components', 'ToastHost.tsx'), 'utf8');
  assert.match(toast, /entering=\{reduceMotion \? undefined : FadeInDown/);
  assert.match(toast, /exiting=\{reduceMotion \? undefined : FadeOutUp/);
});

test('the ritual completion reward does not depend on the shimmer animation', () => {
  // Item 37: the "static glow/check" it asks for already exists — a gold
  // border, gold icon badge and translated "Completed" text, all driven by the
  // plain `done` boolean. This fails if any of those stop being driven by
  // `done` directly (e.g. moved behind the shimmer's animated value).
  const source = readFileSync(join('src', 'components', 'RitualCard.tsx'), 'utf8');
  assert.match(source, /borderColor: done \? t\.gold/);
  assert.match(source, /backgroundColor: done \? t\.goldSoft/);
  assert.match(source, /done \? `\$\{tr\('today\.completed'\)\}/);
});
