import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

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

test('every Reanimated entrance and exit obeys Reduce Motion', () => {
  const offenders: string[] = [];
  for (const file of sourceFiles()) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/\b(entering|exiting)=\{([^}]+)\}/g)) {
      if (!match[2].includes('reduceMotion')) {
        offenders.push(`${file}: ${match[0]}`);
      }
    }
  }
  assert.deepEqual(offenders, [], `unguarded layout animations:\n${offenders.join('\n')}`);
});

test('every native Modal disables its transition under Reduce Motion', () => {
  const offenders: string[] = [];
  for (const file of sourceFiles()) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/<Modal\b[\s\S]*?>/g)) {
      const tag = match[0];
      if (!tag.includes("animationType={reduceMotion ? 'none' :")) {
        offenders.push(file);
      }
    }
  }
  assert.deepEqual(offenders, [], `unguarded native modal transitions:\n${offenders.join('\n')}`);
});

test('navigation and the streak pop obey Reduce Motion', () => {
  const root = readFileSync('app/_layout.tsx', 'utf8');
  const flame = readFileSync('src/components/StreakFlame.tsx', 'utf8');

  assert.match(root, /animation: reduceMotion \? 'none' : 'default'/);
  assert.match(flame, /if \(!reduceMotion && count > prevCount\.current\)/);
  assert.match(flame, /if \(reduceMotion \|\| !litToday\)/);
  assert.doesNotMatch(flame, /AccessibilityInfo\.isReduceMotionEnabled/);
});
