/**
 * Measure real WCAG contrast for text over art-backed cards (roadmap item 50).
 *
 * VerseCard, RitualCard, the "Tonight" card, and the plan cover card all lay
 * text over a photographic/painterly image behind a hand-picked gradient
 * scrim. The scrim's opacity was chosen once, by eye, against whichever
 * image happened to be open at the time — nothing had measured it against
 * every image it actually has to work over, several of which vary in
 * brightness right where the text sits.
 *
 * For each card, this finds the real `<img>` element by its bundled
 * filename, takes its parent (every one of these components renders the
 * `<Image>` and its overlay content as siblings under one container — the
 * one structural fact this script leans on), and scans every leaf text
 * node inside that container: its true bounding box (Playwright's, not
 * hand-computed layout math), hides it, samples the pixel underneath at
 * five points (four corners + centre — the same "worst corner, not the
 * average" approach `measure-tap-targets.mjs` uses for gaps), restores it,
 * and computes the WCAG contrast ratio against the text's own color
 * (composited against the sampled pixel first if the text itself is
 * semi-transparent, rather than assumed opaque).
 *
 * Threshold: 4.5:1 for every text element measured here. None of them meet
 * WCAG's technical definition of "large text" (≥18pt bold, or ≥24pt any
 * weight) — the closest, the plan-card title, is 24px/18pt regular — so the
 * item's named 3:1 "büyük başlık" (large-title) exception does not
 * currently apply to anything this script measures. Stated here rather
 * than assumed silently; see docs/design-100.md item 50 for the full
 * per-element size/weight accounting.
 *
 *   npx expo export --platform web
 *   node scripts/check-card-contrast.mjs
 *
 * Needs a browser, so it is a developer tool rather than a CI gate — the
 * same arrangement as the tap-target measurement and the verse-a11y check.
 */
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { chromium } from 'playwright-core';
import { PNG } from 'pngjs';

const DIST = 'dist';
const PORT = 8139;
const MIN_RATIO = 4.5;

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

const seed = {
  'lumen-user': {
    state: { onboarded: true, themePreference: 'vigil', language: 'en', quiz: { name: 'Reviewer', prayerTime: '07:30' } },
    version: 0,
  },
};

const browser = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM ?? '/opt/pw-browsers/chromium',
});
const page = await browser.newPage({ viewport: { width: 400, height: 900 }, deviceScaleFactor: 1 });
const base = `http://127.0.0.1:${PORT}`;
await page.goto(base);
await page.evaluate((data) => {
  for (const [key, value] of Object.entries(data)) localStorage.setItem(key, JSON.stringify(value));
}, seed);

/** sRGB relative luminance (WCAG). */
function luminance({ r, g, b }) {
  const [R, G, B] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}
function contrastRatio(c1, c2) {
  const [l1, l2] = [luminance(c1), luminance(c2)].sort((a, b) => b - a);
  return (l1 + 0.05) / (l2 + 0.05);
}
/** Composite a possibly-transparent foreground over a sampled background pixel. */
function composite(fg, bg) {
  const a = fg.a ?? 1;
  return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a) };
}
function parseColor(css) {
  const m = css.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
  if (!m) throw new Error(`unparseable color: ${css}`);
  return { r: +m[1], g: +m[2], b: +m[3], a: m[4] !== undefined ? +m[4] : 1 };
}

async function samplePixel(x, y) {
  const buf = await page.screenshot({ clip: { x: Math.round(x), y: Math.round(y), width: 1, height: 1 } });
  const png = PNG.sync.read(buf);
  return { r: png.data[0], g: png.data[1], b: png.data[2] };
}

/** Worst-of-five-points contrast for one text element against what's behind it. */
async function measureLeaf(handle) {
  const text = await handle.evaluate((el) => (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40));
  await handle.scrollIntoViewIfNeeded();
  const box = await handle.boundingBox();
  if (!box || box.width === 0 || box.height === 0) return null;
  const cssColor = await handle.evaluate((el) => getComputedStyle(el).color);
  const fg = parseColor(cssColor);

  // Some leaves (the Tonight card's own "Unlock"/play pill, a <button> with
  // its own solid backgroundColor) carry an opaque fill of their own — the
  // right background to measure against is that fill, not whatever is
  // visually behind the whole card. Hiding the element to sample underneath
  // it would hide that fill too and silently measure the wrong thing (this
  // is exactly how the pill was first "found" to fail at 1.03:1 — the
  // sample had landed on the card's own dark scrim behind the pill, not the
  // pill itself).
  const ownBg = await handle.evaluate((el) => getComputedStyle(el).backgroundColor);
  const ownBgColor = parseColor(ownBg);
  if (ownBgColor.a > 0) {
    const effective = fg.a < 1 ? composite(fg, ownBgColor) : fg;
    const ratio = contrastRatio(effective, ownBgColor);
    const ok = ratio >= MIN_RATIO;
    console.log(
      `  ${ok ? '✓' : '✗'} "${text}": ${ratio.toFixed(2)}:1  (own background ${ownBg}, text ${cssColor})`,
    );
    return { text, ok, ratio };
  }

  const inset = 0.5;
  const points = [
    [box.x + inset, box.y + inset],
    [box.x + box.width - inset, box.y + inset],
    [box.x + inset, box.y + box.height - inset],
    [box.x + box.width - inset, box.y + box.height - inset],
    [box.x + box.width / 2, box.y + box.height / 2],
  ];

  await handle.evaluate((el) => {
    el.dataset.__prevOpacity = el.style.opacity;
    el.style.opacity = '0';
  });
  let worst = Infinity;
  let worstBg = null;
  for (const [x, y] of points) {
    const bg = await samplePixel(x, y);
    const effective = fg.a < 1 ? composite(fg, bg) : fg;
    const ratio = contrastRatio(effective, bg);
    if (ratio < worst) {
      worst = ratio;
      worstBg = bg;
    }
  }
  await handle.evaluate((el) => {
    el.style.opacity = el.dataset.__prevOpacity ?? '';
    delete el.dataset.__prevOpacity;
  });

  const ok = worst >= MIN_RATIO;
  console.log(
    `  ${ok ? '✓' : '✗'} "${text}": ${worst.toFixed(2)}:1  (bg rgb(${Math.round(worstBg.r)},` +
      `${Math.round(worstBg.g)},${Math.round(worstBg.b)}), text ${cssColor})`,
  );
  return { text, ok, ratio: worst };
}

/** Find `<img src*="filenameFragment">`, take its parent, measure every leaf text inside. */
async function measureCard(filenameFragment, label) {
  console.log(`\n${label} (${filenameFragment}):`);
  const img = page.locator(`img[src*="${filenameFragment}"]`).first();
  const imgHandle = await img.elementHandle();
  if (!imgHandle) {
    console.log('  ✗ image not found on this screen');
    return [{ ok: false }];
  }
  // react-native-web's own <Image> wraps itself in an extra absolutely-
  // positioned div (a background-image div plus the literal <img> tag, for
  // its own layout purposes) — the sibling gradient/text layers this script
  // actually wants sit two levels up, on the component's own container.
  const containerHandle = await imgHandle.evaluateHandle((el) => el.parentElement.parentElement);
  const leafArrayHandle = await containerHandle.evaluateHandle((root) => {
    const leaves = [];
    const walk = (el) => {
      const kids = [...el.children];
      const text = (el.textContent || '').trim();
      if (kids.length === 0 && text.length > 0) leaves.push(el);
      else kids.forEach(walk);
    };
    walk(root);
    return leaves;
  });
  const count = await leafArrayHandle.evaluate((arr) => arr.length);
  const results = [];
  for (let i = 0; i < count; i += 1) {
    const leafHandle = (await leafArrayHandle.evaluateHandle((arr, idx) => arr[idx], i)).asElement();
    if (!leafHandle) continue;
    const r = await measureLeaf(leafHandle);
    if (r) results.push(r);
  }
  return results;
}

const allResults = [];

// --- VerseCard: cycle the shuffle until every art variant has been seen ---
console.log('--- VerseCard ---');
await page.goto(`${base}/today`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const wantedVerseArt = [
  'A5-verse-peace',
  'A5-verse-strength',
  'A5-verse-trust',
  'A5-verse-rest',
  'A5-verse-hope',
  'A5-verse-guidance',
  'A5-verse-joy',
  'A5-verse-love',
];
const seenArt = new Set();
const shuffleBtn = page.getByRole('button', { name: 'Another verse' });
// Scoped to the card itself, not `img.first()` on the page — a decorative
// grain-texture image renders earlier in the DOM and matched nothing, which
// silently zeroed out every shuffle attempt the first time this ran.
const verseCardImg = page.locator('[aria-label^="Verse of the day"] img').first();
for (let attempt = 0; attempt < 200 && seenArt.size < wantedVerseArt.length; attempt += 1) {
  const src = await verseCardImg.getAttribute('src').catch(() => null);
  const match = src && wantedVerseArt.find((id) => src.includes(id));
  if (match && !seenArt.has(match)) {
    seenArt.add(match);
    allResults.push(...(await measureCard(match, 'VerseCard')));
  }
  if (seenArt.size < wantedVerseArt.length) {
    await shuffleBtn.click();
    await page.waitForTimeout(150);
  }
}
if (seenArt.size < wantedVerseArt.length) {
  console.log(`\n(only reached ${seenArt.size}/${wantedVerseArt.length} verse art variants in 200 shuffles)`);
}

// --- RitualCard x3 + the Tonight card, all on the same screen ---
console.log('\n--- RitualCard + Tonight card ---');
allResults.push(...(await measureCard('A18-ritual-reading', 'RitualCard (devotional)')));
allResults.push(...(await measureCard('A19-ritual-prayer', 'RitualCard (guided prayer)')));
allResults.push(...(await measureCard('A20-ritual-gratitude', 'RitualCard (gratitude)')));
allResults.push(...(await measureCard('A10-tonight-night', 'Tonight card')));

// --- Plan cards, one screen each ---
console.log('\n--- Plan cards ---');
const plans = [
  ['peace-7', 'A13-plan-cover'],
  ['gratitude-7', 'A13-gratitude7'],
  ['psalms-30', 'A13-psalms30'],
  ['gospels-90', 'A13-gospels90'],
  ['bible-365', 'A13-bible365'],
];
for (const [id, art] of plans) {
  await page.goto(`${base}/plan/${id}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  allResults.push(...(await measureCard(art, `Plan (${id})`)));
}

await browser.close();
server.close();

const failures = allResults.filter((r) => !r.ok);
console.log(`\n${allResults.length} text/background combinations measured.`);
if (failures.length > 0) {
  console.error(`FAILED — ${failures.length} below ${MIN_RATIO}:1.`);
  process.exit(1);
}
console.log(`PASSED — every measured combination clears ${MIN_RATIO}:1.`);
