import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { upper } from './casing.ts';
import { translations } from './translations.ts';

/**
 * Guards roadmap item 33: uppercasing follows the language.
 *
 * `textTransform: 'uppercase'` applies the Unicode default case mapping and has
 * no idea what language it is looking at. Turkish is the one language of the six
 * where that is wrong: dotted `i` uppercases to `İ`, not `I`. The Bible tab's own
 * name, "İncil", rendered as "İNCIL".
 *
 * The rules are checked against the real translation strings rather than invented
 * examples, so a new Turkish label with an `i` in it is covered the moment it is
 * added.
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

test('Turkish keeps the dot on i and takes it off ı', () => {
  assert.equal(upper('Günün ayeti', 'tr'), 'GÜNÜN AYETİ');
  assert.equal(upper('İncil', 'tr'), 'İNCİL');
  assert.equal(upper('Ayet işlemleri', 'tr'), 'AYET İŞLEMLERİ');
  // The dotless ı is the other half of the pair and maps to plain I.
  assert.equal(upper('Uyku duası', 'tr'), 'UYKU DUASI');
  assert.equal(upper('ışık', 'tr'), 'IŞIK');
});

test('the Turkish result does not depend on the runtime honouring the tag', () => {
  // This is the one rule these tests cannot prove by calling upper(): Node's ICU
  // implements toLocaleUpperCase('tr') correctly, so deleting the substitution
  // leaves every assertion above still passing. The app runs on Hermes, where a
  // case mapping that ignores its locale argument would put the bug straight back
  // with nothing to show for it — so the substitution is checked as code.
  const source = readFileSync('src/i18n/casing.ts', 'utf8');
  const turkish = source.slice(source.indexOf("locale === 'tr'"));
  const substitution = turkish.indexOf("replace(/i/g, 'İ')");
  const mapping = turkish.indexOf('toLocaleUpperCase');
  assert.notEqual(substitution, -1, 'the i → İ substitution is gone');
  assert.ok(
    substitution < mapping,
    'the substitution must run before the case mapping, not after',
  );
});

test('the other five languages are unchanged by the Turkish rule', () => {
  assert.equal(upper('Verse of the day', 'en'), 'VERSE OF THE DAY');
  assert.equal(upper('Versículo del día', 'es'), 'VERSÍCULO DEL DÍA');
  assert.equal(upper('Verset du jour', 'fr'), 'VERSET DU JOUR');
  assert.equal(upper('Vers des Tages', 'de'), 'VERS DES TAGES');
  assert.equal(upper('Versículo do dia', 'pt'), 'VERSÍCULO DO DIA');
});

test('no Turkish translation is mangled by the default mapping any more', () => {
  // The measurement that justified this item: how many real strings differ.
  const damaged = Object.entries(translations.tr)
    .filter(([, value]) => typeof value === 'string' && value.toUpperCase() !== upper(value, 'tr'))
    .map(([key]) => key);

  assert.ok(
    damaged.length > 0,
    'no Turkish string contains an i — this guard would be testing nothing',
  );
  // Every one of them is now correct, which is only true because upper() is used.
  for (const key of damaged) {
    const value = (translations.tr as Record<string, string>)[key];
    assert.ok(!upper(value, 'tr').includes('I' + '̇'), `${key} produced a combining dot`);
    assert.equal(upper(value, 'tr'), value.replace(/i/g, 'İ').toLocaleUpperCase('tr'));
  }
});

test('uppercasing is not left to the platform anywhere in the app', () => {
  // textTransform is what made it language-blind. Its absence is the fix.
  const offenders: string[] = [];
  for (const file of sourceFiles()) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/textTransform:\s*'uppercase'/g)) {
      offenders.push(`${file}:${source.slice(0, match.index).split('\n').length}`);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `textTransform: 'uppercase' still in use:\n${offenders.join('\n')}\n` +
      'Use tu() from useT(), which uppercases in the reader’s language.',
  );
});

test('nothing reaches for the language-blind case methods either', () => {
  // toUpperCase() at a call site is the same bug spelled differently. casing.ts
  // is the one place allowed to do the mapping.
  const offenders: string[] = [];
  for (const file of sourceFiles()) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/\.toUpperCase\(\)/g)) {
      offenders.push(`${file}:${source.slice(0, match.index).split('\n').length}`);
    }
  }
  assert.deepEqual(offenders, [], `language-blind toUpperCase():\n${offenders.join('\n')}`);
});

test('uppercasing stays out of the strings a screen reader speaks', () => {
  // Uppercasing is a visual treatment. An accessibilityLabel is not drawn, and
  // TalkBack and VoiceOver both read some all-caps runs out letter by letter, so
  // "CONTINUE READING" becomes an initialism. Caught for real: the first pass at
  // this item wrapped the Bible tab's a11y label instead of its visible eyebrow.
  // The value is a braced expression and usually a template literal, so `${...}`
  // puts closing braces inside it — it has to be read by depth, not by regex.
  const bracedValue = (source: string, from: number): string => {
    let depth = 0;
    for (let i = from; i < source.length; i += 1) {
      if (source[i] === '{') depth += 1;
      else if (source[i] === '}') {
        depth -= 1;
        if (depth === 0) return source.slice(from, i + 1);
      }
    }
    return source.slice(from);
  };

  const offenders: string[] = [];
  for (const file of sourceFiles()) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/accessibility(?:Label|Hint)=\{/g)) {
      const value = bracedValue(source, match.index + match[0].length - 1);
      if (/\btu\(/.test(value)) {
        offenders.push(`${file}:${source.slice(0, match.index).split('\n').length}`);
      }
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `tu() inside a spoken label:\n${offenders.join('\n')}\n` +
      'Uppercase the visible Text, not the accessibility label.',
  );
});

test('the dynamic strings go through it too, not just the labels', () => {
  // Half of what gets uppercased has no translation entry to pre-case: the date
  // on Today, a verse reference, a chapter number, a book name from the Scripture
  // data. Those are also the strings densest in Turkish i.
  const cases: [string, RegExp][] = [
    ['app/(tabs)/today.tsx', /\{tu\(dateLine\)\}/],
    ['app/read.tsx', /tu\(`\$\{tr\('read\.chapter'\)\} \$\{cIdx \+ 1\}`\)/],
    ['src/components/VerseActionSheet.tsx', /\{tu\(verse\.ref\)\}/],
    ['app/(tabs)/journal.tsx', /\{tu\(e\.ref\)\}/],
  ];
  for (const [file, pattern] of cases) {
    assert.match(readFileSync(file, 'utf8'), pattern, `${file} stopped localising its casing`);
  }
});
