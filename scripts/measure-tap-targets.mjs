/**
 * Measure every touch target as rendered (roadmap item 21).
 *
 * `src/theme/tapTargets.test.ts` reads declared sizes, which is fast and runs in
 * CI — but it cannot see a control whose height comes out of padding and line
 * height. That gap was real: the chapter navigation buttons computed to 43dp, the
 * Bible tab's quick actions to 46, and the library filters to 35, all while
 * declaring nothing smaller than the minimum.
 *
 * This walks the built web app in a real browser and reports anything with a
 * button/link/switch role rendering below 48×48.
 *
 *   npx expo export --platform web
 *   node scripts/measure-tap-targets.mjs
 *
 * Needs a browser, so it is a developer tool rather than a CI gate — the same
 * arrangement as the Scripture drift check.
 *
 * Exit 0 = every measured target is at least 48×48.
 */
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { chromium } from 'playwright-core';

const DIST = 'dist';
const PORT = 8137;
const MIN = 48;

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

// Static server with an SPA fallback so dynamic routes resolve client-side.
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

// Enough state that every screen renders its full set of controls.
const seed = {
  'lumen-user': {
    state: {
      onboarded: true,
      themePreference: 'vigil',
      language: 'tr',
      quiz: { name: 'Umut', tradition: null, goals: [], struggles: [], prayerTime: '07:30', experience: null },
    },
    version: 0,
  },
  'lumen-reader': { state: { book: 18, chapter: 22 }, version: 0 },
  'lumen-bookmarks': {
    state: {
      bookmarks: [
        { book: 18, chapter: 22, verse: 0, ref: 'Mezmur 23:1', preview: '…', createdAt: 1 },
      ],
    },
    version: 0,
  },
  'lumen-highlights': { state: { marks: { 'PSA|22|0': 'gold' } }, version: 0 },
  'lumen-journal': {
    state: { entries: [{ id: 'e1', day: '2026-07-26', kind: 'gratitude', text: 'Şükran', createdAt: 1 }] },
    version: 0,
  },
};

const browser = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM ?? '/opt/pw-browsers/chromium',
});
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, locale: 'tr-TR' });
const pageErrors = [];
page.on('pageerror', (error) => pageErrors.push(String(error.message)));

const base = `http://127.0.0.1:${PORT}`;
await page.goto(base);
await page.evaluate((data) => {
  for (const [key, value] of Object.entries(data)) localStorage.setItem(key, JSON.stringify(value));
}, seed);

async function measure(label, path, prepare) {
  await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2800);
  if (prepare) await prepare();
  const small = await page.evaluate((min) => {
    const found = [];
    for (const el of document.querySelectorAll('[role="button"], [role="link"], [role="switch"]')) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;
      if (rect.bottom < 0 || rect.top > 2000) continue;
      if (rect.width < min || rect.height < min) {
        found.push({
          label: (el.getAttribute('aria-label') || el.textContent || '?').trim().slice(0, 40),
          size: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
        });
      }
    }
    return found;
  }, MIN);
  console.log(`${small.length ? '✗' : '✓'} ${label} — ${small.length} under ${MIN}dp`);
  for (const item of small) console.log(`      ${item.size}  ${item.label}`);
  return small;
}

const screens = [
  ['Today', '/today'],
  ['Bible', '/bible'],
  ['Pray', '/pray'],
  ['Journal', '/journal'],
  ['Profile', '/profile'],
  ['Reader', '/read'],
  ['Library', '/library'],
  ['Text source', '/source'],
];

let offenders = 0;
for (const [label, path] of screens) offenders += (await measure(label, path)).length;
offenders += (
  await measure('Search (typed)', '/search', async () => {
    await page.getByRole('textbox').first().fill('sevgi');
    await page.waitForTimeout(1200);
  })
).length;

await browser.close();
server.close();

if (pageErrors.length) {
  console.error(`\nPage errors while measuring:\n  ${pageErrors.join('\n  ')}`);
}
console.log('');
if (offenders) {
  console.error(
    `Tap-target measurement FAILED — ${offenders} control(s) render below ${MIN}dp.\n` +
      'Declare minHeight: TAP_MIN rather than relying on padding to reach the minimum.',
  );
  process.exit(1);
}
console.log(`Tap-target measurement passed — every control on ${screens.length + 1} screens is at least ${MIN}dp.`);
