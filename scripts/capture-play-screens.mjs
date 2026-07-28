import { createServer } from 'node:http';
import { mkdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { extname, join } from 'node:path';
import { chromium } from 'playwright-core';

const dist = process.argv[2] ?? 'dist-play-screens';
const out = 'docs/play-store/assets/screenshots';
const port = 8138;
if (!existsSync(dist)) {
  console.error(`${dist}/ is missing. Export web first.`);
  process.exit(2);
}

const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.ttf': 'font/ttf',
};
const server = createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0]);
  let file = join(dist, urlPath);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file) && existsSync(`${file}.html`)) file = `${file}.html`;
  if (!existsSync(file)) file = join(dist, 'index.html');
  res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));

const seed = {
  'lumen-user': {
    state: {
      onboarded: true,
      themePreference: 'vigil',
      language: 'en',
      quiz: { name: '', tradition: null, goals: [], struggles: [], prayerTime: '07:30', experience: null },
    },
    version: 0,
  },
  'lumen-reader': { state: { book: 18, chapter: 22, verse: 0 }, version: 0 },
  'lumen-journal': {
    state: {
      entries: [{
        id: 'store-example',
        day: '2026-07-28',
        kind: 'gratitude',
        text: 'A quiet morning and another chance to begin.',
        createdAt: 1785225600000,
      }],
    },
    version: 0,
  },
};

const browser = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM ?? chromium.executablePath(),
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, locale: 'en-US' });
await page.addInitScript((data) => {
  for (const [key, value] of Object.entries(data)) localStorage.setItem(key, JSON.stringify(value));
}, seed);

const screens = [
  ['01-today', '/today'],
  ['02-bible', '/bible'],
  ['03-prayer', '/pray'],
  ['04-journal', '/journal'],
  ['05-plus', '/paywall'],
];
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));

for (const [size, viewport] of [
  ['phone-390x844', { width: 390, height: 844 }],
  ['qa-360x640', { width: 360, height: 640 }],
]) {
  mkdirSync(join(out, size), { recursive: true });
  await page.setViewportSize(viewport);
  for (const [name, route] of screens) {
    await page.goto(`http://127.0.0.1:${port}${route}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(900);
    await page.screenshot({ path: join(out, size, `${name}.png`) });
  }
}

await browser.close();
server.close();
if (errors.length) {
  console.error([...new Set(errors)].join('\n'));
  process.exit(1);
}
console.log(`Captured ${screens.length * 2} screens in ${out}`);
