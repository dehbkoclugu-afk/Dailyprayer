import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

/**
 * Guards roadmap items 36 and 37: every animation obeys the system setting, and
 * the completion reward degrades to something still visible rather than nothing.
 *
 * Coverage was the smaller half of the problem. Four animations were ungated —
 * the toast that fires on every undo, copy and save; the ritual completion check;
 * the progress dot; and the streak pop, which sat directly beside a pulse that
 * *was* gated, so reduce motion silenced the gentle animation and left the sharp
 * one running.
 *
 * The larger half is that neither way of reading the setting could see it change.
 * Reanimated's `useReducedMotion()` is a module constant — its own documentation
 * says "whether the reduced motion setting was enabled when the app started" —
 * and `StreakFlame` used a one-shot promise. On Android the setting lives in
 * Settings, so it is turned on by leaving the app, changing it, and coming back:
 * the app is not restarted, and the one moment the setting exists for is the one
 * moment neither reading could see. `useReduceMotion` subscribes instead.
 *
 * What a source guard cannot do is turn the setting on and watch. That needs a
 * device, like the other native-only accessibility behaviour in this app.
 */

const ROOTS = ['app', 'src'];
const HOOK = 'src/a11y/reduceMotion.ts';

/**
 * Source with comments removed.
 *
 * These files deliberately quote the code they replaced, so a rule that forbids
 * an identifier would otherwise be tripped by the comment explaining why it is
 * forbidden. `notFoundState.test.ts` does the same for the same reason.
 */
function code(file: string): string {
  return readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function sourceFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry)) out.push(path);
    }
  };
  for (const root of ROOTS) walk(root);
  return out;
}

test('the setting is read in one place, and that place subscribes', () => {
  const source = readFileSync(HOOK, 'utf8');
  assert.match(
    source,
    /addEventListener\('reduceMotionChanged'/,
    'the hook no longer listens for the setting changing',
  );
  assert.match(source, /subscription\.remove\(\)/, 'the listener is never removed');
  // Seeded synchronously: an async-only read leaves a frame where an entering
  // animation has already started before anyone knows it should not have.
  assert.match(source, /useState\(useReanimatedStaticValue\)/, 'the hook lost its synchronous seed');
});

test('nothing else reads the setting for itself', () => {
  // Both of the readings this replaced were stale-on-change, in different ways.
  const offenders: string[] = [];
  for (const file of sourceFiles()) {
    if (file === HOOK) continue;
    const source = code(file);
    for (const pattern of [/useReducedMotion\b/, /isReduceMotionEnabled\b/]) {
      const match = pattern.exec(code(file));
      if (match) offenders.push(`${file}:${source.slice(0, match.index).split('\n').length}`);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `the setting read outside the hook:\n${offenders.join('\n')}\n` +
      'Use useReduceMotion() from @/a11y/reduceMotion — it stays current.',
  );
});

test('no entering or exiting animation runs unconditionally', () => {
  // A layout animation prop with no reduceMotion in its expression is one that
  // plays whatever the reader asked for.
  const offenders: string[] = [];
  for (const file of sourceFiles()) {
    const source = code(file);
    for (const match of source.matchAll(/\b(entering|exiting)=\{([^}]*)\}/g)) {
      if (!/reduceMotion/.test(match[2])) {
        offenders.push(`${file}:${source.slice(0, match.index).split('\n').length} ${match[1]}`);
      }
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `ungated layout animations:\n${offenders.join('\n')}\n` +
      'Gate on useReduceMotion(): entering={reduceMotion ? undefined : …}.',
  );
});

test('a repeating animation can be stopped by the setting changing', () => {
  // withRepeat runs until something cancels it. If the effect that starts it does
  // not depend on reduceMotion, turning the setting on cannot re-run the cleanup,
  // and the loop keeps going for the rest of the session.
  const source = code('src/components/StreakFlame.tsx');
  for (const deps of source.matchAll(/\}, \[([^\]]*)\]\);/g)) {
    assert.match(deps[1], /reduceMotion/, `an effect in StreakFlame ignores the setting: [${deps[1]}]`);
  }
  assert.match(source, /cancelAnimation\(scale\)/, 'the pulse is never cancelled');
});

test('the completion reward survives reduce motion as something visible', () => {
  // Item 37. ReduceMotion.System was not this: Reanimated skips the tween and
  // assigns the end value, so the gold band travelled nowhere and parked off the
  // card's right edge — the reward became nothing at all.
  const source = code('src/components/RitualCard.tsx');
  assert.doesNotMatch(source, /ReduceMotion\.System/, 'the shimmer is skipped rather than replaced');
  assert.match(
    source,
    /reduceMotion \? \(\s*done \?/,
    'there is no still alternative for the completed state',
  );
  // The sweep must not even be started, or the shared value animates unseen.
  assert.match(source, /if \(reduceMotion\) return;/, 'the sweep still runs under reduce motion');
});

test('the still reward is the same colour as the moving one', () => {
  // A reader who turns off motion should still recognise a finished ritual, and
  // recognise it as the same thing other people see.
  const source = readFileSync('src/components/RitualCard.tsx', 'utf8');
  const golds = [...source.matchAll(/rgba\(217,164,65,[\d.]+\)/g)].map((m) => m[0]);
  assert.ok(golds.length >= 4, 'the reward gradients are gone');
});
