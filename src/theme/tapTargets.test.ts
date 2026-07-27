import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { TAP_MIN } from './tokens.ts';

/**
 * Guards roadmap item 21: no touch target below 48×48 dp.
 *
 * Material's minimum is 48; several controls sat at 44, and a few icon buttons had
 * no size at all and leaned on `hitSlop`. That makes the thing you can see and the
 * thing you can hit different sizes, which is what makes small controls feel
 * unreliable — so `hitSlop` does not count as a target here.
 *
 * The check reads the opening tag of every `<Pressable>` and looks at the sizes
 * declared on the Pressable itself. Decorative Views nested inside a large
 * pressable row are deliberately out of scope: the row is the target.
 */

const ROOTS = ['app', 'src'];

function sourceFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.tsx$/.test(entry) && !/\.test\.tsx$/.test(entry)) out.push(path);
    }
  };
  for (const root of ROOTS) walk(root);
  return out;
}

/** The opening tag of each <Pressable>, where its own style is declared. */
function pressableTags(source: string): { tag: string; line: number }[] {
  const tags: { tag: string; line: number }[] = [];
  const re = /<Pressable\b/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(source))) {
    const rest = source.slice(match.index);
    // Multi-line tags close on their own line; single-line ones at the first '>'.
    const multi = rest.search(/\n\s*\/?>/);
    const single = rest.indexOf('>');
    const end = multi !== -1 && multi < 2000 ? multi : single;
    tags.push({
      // shadowOffset carries its own width/height that say nothing about the target.
      tag: rest.slice(0, end === -1 ? 400 : end).replace(/shadowOffset:\s*\{[^}]*\}/g, ''),
      line: source.slice(0, match.index).split('\n').length,
    });
  }
  return tags;
}

test('the minimum tap target is Material’s 48dp', () => {
  assert.equal(TAP_MIN, 48);
});

test('no Pressable declares a dimension smaller than the minimum', () => {
  const offenders: string[] = [];
  for (const file of sourceFiles()) {
    const source = readFileSync(file, 'utf8');
    for (const { tag, line } of pressableTags(source)) {
      for (const [, prop, value] of tag.matchAll(/\b(width|height|minWidth|minHeight):\s*(\d+)/g)) {
        if (Number(value) < TAP_MIN) offenders.push(`${file}:${line} ${prop}: ${value}`);
      }
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `touch targets below ${TAP_MIN}dp:\n${offenders.join('\n')}\n` +
      'Use TAP_MIN from @/theme/tokens rather than a literal.',
  );
});

test('sized targets use the token, not a repeated literal', () => {
  // A literal 48 works but drifts; the token is what makes the rule findable.
  const literals: string[] = [];
  for (const file of sourceFiles()) {
    const source = readFileSync(file, 'utf8');
    for (const { tag, line } of pressableTags(source)) {
      if (/\b(width|height|minWidth|minHeight):\s*48\b/.test(tag)) literals.push(`${file}:${line}`);
    }
  }
  assert.deepEqual(literals, [], `use TAP_MIN instead of a literal 48:\n${literals.join('\n')}`);
});

test('an icon button is not left with only hitSlop', () => {
  // hitSlop extends the touchable region but leaves the visible control small.
  const offenders: string[] = [];
  for (const file of sourceFiles()) {
    const source = readFileSync(file, 'utf8');
    for (const { tag, line } of pressableTags(source)) {
      if (!/hitSlop/.test(tag)) continue;
      const sized = /\b(width|height|minHeight|flex|paddingVertical|padding):/.test(tag);
      if (!sized) offenders.push(`${file}:${line}`);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `Pressables relying on hitSlop with no size of their own:\n${offenders.join('\n')}`,
  );
});
