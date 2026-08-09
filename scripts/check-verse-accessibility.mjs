/**
 * Verify a verse's screen-reader announcement is one clean sentence, not the
 * nested-Text fragments underneath it (roadmap item 47).
 *
 * `app/read.tsx` gives every verse an explicit `accessibilityLabel` (roadmap
 * item 25) precisely because its visible numeral/drop-cap is a nested `Text`
 * that would otherwise be read as a bare number running into the first word
 * of the verse, or read twice if the nested node kept an accessible identity
 * of its own. `src/a11y/labels.test.ts` already proves the *source* declares
 * the label correctly; this checks what a real render actually exposes:
 *
 *  - the rendered element's accessible name is the single label string, not
 *    fragments of it;
 *  - none of its nested `Text` children carry their own `aria-label` (which
 *    would give a screen reader two names to read instead of one);
 *  - the label's tail is the real verse text, not truncated or duplicated.
 *
 *   npx expo export --platform web
 *   node scripts/check-verse-accessibility.mjs
 *
 * Needs a browser, so it is a developer tool rather than a CI gate — the
 * same arrangement as the tap-target measurement and the Scripture drift
 * check.
 */
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { chromium } from 'playwright-core';

const DIST = 'dist';
const PORT = 8138;

if (!existsSync(DIST)) {
  console.error(`${DIST}/ is missing. Run: npx expo export --platform web`);
  process.exit(2);
}

const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.ttf': 'font/ttf',
};

const server = createServer((req, res) => {
  const path = decodeURIComponent((req.url ?? '/').split('?')[0]);
  let file = join(DIST, path);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file) && existsSync(`${file}.html`)) file = `${file}.html`;
  if (!existsSync(file)) file = join(DIST, 'index.html');
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));

// Psalm 23 (book 18, chapter index 22) — six short verses, English, so the
// label text is asserted against directly rather than through a translation.
const seed = {
  'lumen-user': {
    state: { onboarded: true, themePreference: 'vigil', language: 'en', quiz: { name: 'Reviewer' } },
    version: 0,
  },
  'lumen-reader': { state: { book: 18, chapter: 22 }, version: 0 },
};

const browser = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM ?? '/opt/pw-browsers/chromium',
});
const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
const base = `http://127.0.0.1:${PORT}`;
await page.goto(base);
await page.evaluate((data) => {
  for (const [key, value] of Object.entries(data)) localStorage.setItem(key, JSON.stringify(value));
}, seed);
await page.goto(`${base}/read`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

const verses = await page.evaluate(() => {
  const nodes = [...document.querySelectorAll('[aria-label^="Verse "]')];
  return nodes.slice(0, 2).map((el) => ({
    ariaLabel: el.getAttribute('aria-label'),
    text: el.textContent,
    nestedLabels: [...el.querySelectorAll('[aria-label]')].map((n) => n.getAttribute('aria-label')),
    nestedCount: el.querySelectorAll('*').length,
  }));
});

let failed = false;

if (verses.length < 2) {
  console.error(`✗ expected at least 2 verse elements with a "Verse N" label, found ${verses.length}`);
  failed = true;
}

for (const [i, v] of verses.entries()) {
  console.log(`\nverse ${i}:`);
  console.log(`  aria-label: ${JSON.stringify(v.ariaLabel)}`);
  console.log(`  visible text: ${JSON.stringify(v.text)}`);
  console.log(`  nested elements with their own aria-label: ${v.nestedLabels.length}`);

  const match = v.ariaLabel?.match(/^Verse (\d+)\. (.+)$/s);
  if (!match) {
    console.error(`  ✗ label is not the expected "Verse N. <text>" shape`);
    failed = true;
    continue;
  }
  const [, num, tail] = match;

  // The verse number appears once in the label (right after "Verse "), and
  // must not appear a second time glued onto the tail — the exact shape a
  // bare nested numeral running into the label would produce.
  if (tail.startsWith(`${num}`) || tail.startsWith(`${num}  `)) {
    console.error(`  ✗ verse number ${num} appears to repeat at the start of the text`);
    failed = true;
  }

  // The tail must be a real, non-trivial sentence — not truncated to nothing
  // and not just the drop-cap's lone first letter.
  if (tail.trim().length < 10) {
    console.error(`  ✗ label's text tail looks truncated: ${JSON.stringify(tail)}`);
    failed = true;
  }

  // No nested node may carry its own accessible name — that is what would
  // make a screen reader announce the numeral and the label separately.
  if (v.nestedLabels.length > 0) {
    console.error(`  ✗ nested element(s) have their own aria-label: ${JSON.stringify(v.nestedLabels)}`);
    failed = true;
  }

  if (!failed) console.log('  ✓ one clean label, no repetition, no nested accessible names');
}

await browser.close();
server.close();

if (failed) {
  console.error('\nFAILED');
  process.exit(1);
}
console.log('\nPASSED — verse announcements are single, un-repeated sentences.');
