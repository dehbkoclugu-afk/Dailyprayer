import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

/**
 * Guard for roadmap item 11: no UI or AI flow may transform Scripture.
 *
 * Summarize, simplify, rewrite, retell and auto-translate must not exist on the
 * reader or the sharing surfaces. Two of the six bundled editions forbid
 * derivative works or require changes to be marked (YTC is CC BY-ND 4.0), and
 * `docs/scripture-integrity.md` treats a paraphrased verse as a breach of trust
 * rather than a bug — so this is enforced here instead of only written down.
 *
 * These assertions read the source tree. They are cheap and blunt on purpose: a
 * transform flow is easy to add by accident and hard to notice in review.
 */

const ROOTS = ['app', 'src'];

/** Every .ts/.tsx file under app/ and src/, excluding tests and generated data. */
function sourceFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) {
        walk(path);
        continue;
      }
      if (!/\.tsx?$/.test(entry)) continue;
      if (/\.test\.tsx?$/.test(entry)) continue;
      out.push(path);
    }
  };
  for (const root of ROOTS) walk(root);
  return out;
}

const FILES = sourceFiles();
const read = (path: string) => readFileSync(path, 'utf8');

test('no runtime network client exists, so no text service can be reached', () => {
  // Summarizing, simplifying, rewriting or machine-translating Scripture needs a
  // service call. The app is offline-first by design and its Privacy Policy says
  // so, so any client here would contradict both. Purchases go through the
  // RevenueCat native module, not an HTTP client.
  const offenders: string[] = [];
  for (const path of FILES) {
    const src = read(path);
    for (const pattern of [/\bfetch\s*\(/, /\baxios\b/, /XMLHttpRequest/, /\bnew WebSocket\b/, /EventSource/]) {
      if (pattern.test(src)) offenders.push(`${path} matches ${pattern}`);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `network client found. Scripture must never pass through a remote service, and the ` +
      `Privacy Policy promises offline-first behavior:\n${offenders.join('\n')}`,
  );
});

test('no AI or machine-translation dependency is imported', () => {
  const vendors = [
    'openai',
    '@anthropic-ai',
    '@google/generative-ai',
    '@google-cloud/translate',
    'replicate',
    '@huggingface',
    'langchain',
    'deepl',
    'i18next-http-backend',
  ];
  const offenders: string[] = [];
  for (const path of FILES) {
    const src = read(path);
    for (const vendor of vendors) {
      if (src.includes(`'${vendor}`) || src.includes(`"${vendor}`)) {
        offenders.push(`${path} imports ${vendor}`);
      }
    }
  }
  assert.deepEqual(offenders, [], `AI/translation dependency found:\n${offenders.join('\n')}`);

  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
  for (const vendor of vendors) {
    assert.ok(
      !deps.some((dep) => dep.startsWith(vendor)),
      `package.json declares ${vendor}`,
    );
  }
});

test('no transform vocabulary reaches the interface', () => {
  // A button cannot be labeled "Simplify" if the key does not exist. Checked
  // against the dictionary and every source file, in case a label is inlined.
  const forbidden = [
    /summari[sz]/i,
    /simplif/i,
    /paraphras/i,
    /\brewrite\b/i,
    /\bretell\b/i,
    /moderni[sz]e/i,
    /translateVerse/i,
    /autoTranslate/i,
    /explainVerse/i,
  ];
  const offenders: string[] = [];
  for (const path of [...FILES, 'src/i18n/translations.ts']) {
    const src = read(path);
    for (const pattern of forbidden) {
      if (pattern.test(src)) offenders.push(`${path} matches ${pattern}`);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `Scripture-transforming vocabulary found:\n${offenders.join('\n')}`,
  );
});

test('the verse action sheet offers only verbatim actions', () => {
  // Allowlist, not denylist: a new action has to be added here deliberately, and
  // whoever adds it has to decide whether it transforms the text.
  const src = read('src/components/VerseActionSheet.tsx');
  const calls = [...src.matchAll(/action\(\s*'([^']+)',\s*([\s\S]*?),\s*on[A-Z]\w+/g)];
  const why = [
    'The verse actions changed. Every action must keep the Scripture text byte-for-byte:',
    'bookmark, copy, share and save-to-journal all pass verse.text through unchanged.',
    'If you added an action that alters the text, it is not allowed (roadmap item 11).',
  ].join(' ');

  const icons = calls.map((m) => m[1]).sort();
  assert.deepEqual(icons, ['bookmark', 'copy-outline', 'create-outline', 'share-outline'], why);

  // Labels may branch (bookmark toggles its wording), so every key used across the
  // action labels has to sit in the allowlist.
  const allowed = new Set([
    'verse.bookmark',
    'verse.bookmarked',
    'verse.copy',
    'verse.share',
    'verse.saveJournal',
  ]);
  for (const [, , labelExpr] of calls.map((m) => [m[0], m[1], m[2]] as const)) {
    for (const [, key] of labelExpr.matchAll(/tr\('(verse\.[a-zA-Z]+)'\)/g)) {
      assert.ok(allowed.has(key), `${why} Unexpected action label: ${key}`);
    }
  }
});

test('copy and share send the verse verbatim with its reference and credit', () => {
  const src = read('src/components/VerseActionSheet.tsx');
  // The payload must be the raw text, its reference and the edition credit — no
  // slicing, no casing, nothing else interpolated into the Scripture itself.
  assert.match(
    src,
    /const payload = `“\$\{verse\.text\}”\\n— \$\{verse\.ref\}\\n\$\{getBibleCredit\(locale\)\}`/,
    'the copy/share payload must stay verbatim and carry the edition credit',
  );
  for (const sink of [/Clipboard\.setStringAsync\(payload\)/, /Share\.share\(\{ message: payload \}\)/]) {
    assert.match(src, sink, 'copy and share must both send the shared payload');
  }
  assert.doesNotMatch(src, /verse\.text\.(slice|substring|replace|toUpperCase|toLowerCase|split)/);
});

test('the daily verse cannot leave the app without its credit', () => {
  // The card is shared as an image and as text; both carry the attribution, and
  // the credit is rendered on the card so the image is compliant on its own.
  const src = read('src/components/VerseCard.tsx');
  assert.match(src, /const credit = getBibleCredit\(locale\)/);
  assert.match(
    src,
    /const text = `“\$\{verse\.text\}” — \$\{verse\.reference\}\\n\$\{credit\}/,
    'the text fallback must include the credit',
  );
  assert.match(src, /\{credit\}\s*<\/Text>/, 'the card must render the credit for the image share');
  assert.doesNotMatch(src, /verse\.text\.(slice|substring|replace|toUpperCase|toLowerCase|split)/);
});

test('the i18n dictionary carries no Scripture', () => {
  // Scripture must never be routed through the UI translation layer: the reader
  // selects an already-bundled edition instead of translating one into another.
  for (const path of ['src/i18n/translations.ts', 'src/i18n/index.ts']) {
    const src = read(path);
    for (const forbidden of ['bibleFull', 'bible-full', 'scriptureRights', "from './verses'", "@/data/verses"]) {
      assert.ok(!src.includes(forbidden), `${path} must not reach Scripture data (${forbidden})`);
    }
  }
});

test('Scripture render sites do not change the case of the text', () => {
  // textTransform is used for UI chrome and reference labels; it must never wrap a
  // Scripture text node, and the text must never be re-cased in JS.
  for (const path of [
    'app/read.tsx',
    'app/search.tsx',
    'app/library.tsx',
    'src/components/VerseCard.tsx',
    'src/components/VerseActionSheet.tsx',
  ]) {
    const src = read(path);
    assert.ok(!/toUpperCase|toLocaleUpperCase/.test(src), `${path} re-cases text in JS`);
  }
});
