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
 * button/link/switch role rendering below 48×48, and any two adjacent targets with
 * less than 8dp of clear space between them (roadmap item 22).
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
/** Minimum clear space between two adjacent targets (roadmap item 22). */
const GAP_MIN = 8;

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
  const { small, tight, total } = await page.evaluate(
    ({ min, gapMin }) => {
      // When a sheet is open the screen behind it is covered, so its controls are
      // not reachable and must not be compared against the sheet's. React Native
      // Web renders a Modal into a fixed-position layer; scope to the topmost one.
      const layers = [...document.querySelectorAll('*')].filter((el) => {
        const style = getComputedStyle(el);
        if (style.position !== 'fixed') return false;
        const rect = el.getBoundingClientRect();
        return rect.width >= innerWidth * 0.9 && rect.height >= innerHeight * 0.6;
      });
      const root = layers.length ? layers[layers.length - 1] : document;

      const targets = [];
      for (const el of root.querySelectorAll('[role="button"], [role="link"], [role="switch"]')) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) continue;
        if (rect.bottom < 0 || rect.top > 2000) continue;
        targets.push({
          el,
          rect,
          label: (el.getAttribute('aria-label') || el.textContent || '?').trim().slice(0, 40),
        });
      }

      const small = targets
        .filter((t) => t.rect.width < min || t.rect.height < min)
        .map((t) => ({
          label: t.label,
          size: `${Math.round(t.rect.width)}x${Math.round(t.rect.height)}`,
        }));

      // A stacked list row separated by a rule is a standard contiguous pattern —
      // Material's own lists have no gaps — and forcing 8dp between settings rows
      // would be worse design, not safer. So a divider drawn along the boundary
      // counts as the separation.
      // The rule may be drawn either way round — as a bottom border on the row
      // above or a top border on the row below. Both put a line on the boundary.
      const hasRuleAt = (el, edge) =>
        [...el.querySelectorAll('*'), el].some((node) => {
          const style = getComputedStyle(node);
          const rect = node.getBoundingClientRect();
          const bottomRule =
            parseFloat(style.borderBottomWidth) >= 1 && Math.abs(rect.bottom - edge) <= 2;
          const topRule = parseFloat(style.borderTopWidth) >= 1 && Math.abs(rect.top - edge) <= 2;
          return bottomRule || topRule;
        });

      // Adjacent targets otherwise need clear space, or a near-miss lands on the
      // neighbour. Nested targets are one control, not two.
      const tight = [];
      for (let i = 0; i < targets.length; i += 1) {
        for (let j = i + 1; j < targets.length; j += 1) {
          const a = targets[i];
          const b = targets[j];
          if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
          const overlapsX = a.rect.left < b.rect.right && b.rect.left < a.rect.right;
          const overlapsY = a.rect.top < b.rect.bottom && b.rect.top < a.rect.bottom;
          let gap = null;
          let axis = '';
          if (overlapsY && !overlapsX) {
            gap = Math.max(b.rect.left - a.rect.right, a.rect.left - b.rect.right);
            axis = 'side by side';
          } else if (overlapsX && !overlapsY) {
            gap = Math.max(b.rect.top - a.rect.bottom, a.rect.top - b.rect.bottom);
            axis = 'stacked';
            const upper = a.rect.top < b.rect.top ? a : b;
            const lower = upper === a ? b : a;
            const boundary = (upper.rect.bottom + lower.rect.top) / 2;
            if (hasRuleAt(upper.el, boundary) || hasRuleAt(lower.el, boundary)) continue;
          }
          if (gap !== null && gap < gapMin) {
            tight.push({ a: a.label, b: b.label, gap: Math.round(gap * 10) / 10, axis });
          }
        }
      }
      return { small, tight, total: targets.length };
    },
    { min: MIN, gapMin: GAP_MIN },
  );

  const ok = small.length === 0 && tight.length === 0;
  // The count makes an un-opened sheet obvious: it would report the screen behind it.
  console.log(
    `${ok ? '✓' : '✗'} ${label} — ${total} targets, ${small.length} under ${MIN}dp, ` +
      `${tight.length} gap(s) under ${GAP_MIN}dp`,
  );
  for (const item of small) console.log(`      size  ${item.size}  ${item.label}`);
  for (const item of tight)
    console.log(`      gap   ${item.gap}dp (${item.axis})  "${item.a}" ↔ "${item.b}"`);
  return small.length + tight.length;
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
for (const [label, path] of screens) offenders += await measure(label, path);
offenders += await measure('Search (typed)', '/search', async () => {
  await page.getByRole('textbox').first().fill('sevgi');
  await page.waitForTimeout(1200);
});

// Sheets carry the densest clusters in the app — the verse action row and the
// highlight swatches are exactly what roadmap item 22 names — so they are worth
// measuring even though no screen shows them by default.
offenders += await measure('Reader · verse actions sheet', '/read', async () => {
  // Verse rows are <Text onPress>, not Pressable, so they carry no button role
  // (roadmap item 25 covers that). Reach one by its text instead.
  const verse = page.getByText(/çoban|pastor|shepherd|berger|Hirte/i).first();
  await verse.click({ timeout: 5000 });
  await page.waitForTimeout(1500);
});

// The picker only became measurable once its rows carried a button role
// (roadmap item 23); before that it was invisible to this scan.
const openPicker = async () => {
  await page.getByRole('button', { name: /kitap ve bölüm seç/i }).click({ timeout: 5000 });
  await page.waitForTimeout(1500);
};
offenders += await measure('Reader · book picker', '/read', openPicker);
offenders += await measure('Reader · chapter picker', '/read', async () => {
  await openPicker();
  await page.getByRole('button', { name: 'Mezmurlar', exact: true }).click({ timeout: 5000 });
  await page.waitForTimeout(1500);
});

offenders += await measure('Reader · reading settings sheet', '/read', async () => {
  const settings = page.getByLabel('Okuma ayarları');
  if (await settings.count()) {
    await settings.first().click();
    await page.waitForTimeout(1500);
  }
});

await browser.close();
server.close();

// An uncaught exception means the page being measured is not the page that
// ships. These used to be printed and ignored; the run that added sheet focus
// threw `findNodeHandle is not supported on web` on every sheet open, and the
// note scrolled past under a row of green ticks. It fails the run now.
if (pageErrors.length) {
  console.error(
    `\nTap-target measurement FAILED — ${pageErrors.length} uncaught page error(s):\n  ` +
      `${[...new Set(pageErrors)].join('\n  ')}`,
  );
  process.exit(1);
}
console.log('');
if (offenders) {
  console.error(
    `Tap-target measurement FAILED — ${offenders} problem(s).\n` +
      `Targets must render at least ${MIN}×${MIN}dp (declare minHeight: TAP_MIN rather than\n` +
      `relying on padding), and adjacent targets need at least ${GAP_MIN}dp of clear space.`,
  );
  process.exit(1);
}
console.log(
  `Tap-target measurement passed — on ${screens.length + 5} views every control is at least ` +
    `${MIN}dp with ${GAP_MIN}dp between neighbours.`,
);
