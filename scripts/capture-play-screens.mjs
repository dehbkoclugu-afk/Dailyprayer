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
const screens = [
  ['01-today', '/today'],
  ['02-bible', '/read'],
  ['03-prayer', '/pray'],
  ['04-journal', '/journal'],
];
const errors = [];

const locales = [
  ['en-US', 'en', 'A quiet morning and another chance to begin.'],
  ['tr-TR', 'tr', 'Sakin bir sabah ve yeniden başlamak için bir fırsat.'],
  ['es-ES', 'es', 'Una mañana tranquila y otra oportunidad para comenzar.'],
  ['pt-BR', 'pt', 'Uma manhã tranquila e mais uma chance de recomeçar.'],
  ['fr-FR', 'fr', 'Un matin paisible et une nouvelle chance de commencer.'],
  ['de-DE', 'de', 'Ein ruhiger Morgen und eine neue Chance, anzufangen.'],
];

const seedFor = (language, journal) => ({
  ...seed,
  'lumen-user': {
    ...seed['lumen-user'],
    state: { ...seed['lumen-user'].state, language },
  },
  'lumen-journal': {
    state: {
      entries: [{
        ...seed['lumen-journal'].state.entries[0],
        text: journal,
      }],
    },
    version: 0,
  },
});

async function captureSet(folder, viewport, browserLocale, data) {
  mkdirSync(join(out, folder), { recursive: true });
  const page = await browser.newPage({ viewport, locale: browserLocale });
  page.on('pageerror', (error) => errors.push(`${browserLocale}: ${error.message}`));
  await page.addInitScript((values) => {
    for (const [key, value] of Object.entries(values)) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, data);
  for (const [name, route] of screens) {
    await page.goto(`http://127.0.0.1:${port}${route}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(900);
    await page.screenshot({ path: join(out, folder, `${name}.png`) });
  }
  await page.close();
}

for (const [tag, language, journal] of locales) {
  await captureSet(`localized/${tag}`, { width: 390, height: 844 }, tag, seedFor(language, journal));
}
await captureSet('qa-360x640', { width: 360, height: 640 }, 'en-US', seedFor('en', locales[0][2]));

await browser.close();
server.close();
if (errors.length) {
  console.error([...new Set(errors)].join('\n'));
  process.exit(1);
}
console.log(`Captured ${screens.length * (locales.length + 1)} screens in ${out}`);
