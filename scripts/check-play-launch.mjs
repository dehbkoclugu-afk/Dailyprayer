import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const text = (path) => readFileSync(path, 'utf8');
const pngSize = (path) => {
  const png = readFileSync(path);
  assert.equal(png.subarray(1, 4).toString(), 'PNG');
  return [png.readUInt32BE(16), png.readUInt32BE(20)];
};

const config = JSON.parse(text('app.json'));
assert.equal(config.expo.android.package, 'com.lumen.dailyprayer');

assert.deepEqual(pngSize('docs/play-store/assets/feature-graphic.png'), [1024, 500]);
for (const name of ['01-today', '02-bible', '03-prayer', '04-journal']) {
  assert.deepEqual(pngSize(`docs/play-store/assets/screenshots/phone-390x844/${name}.png`), [390, 844]);
  assert.deepEqual(pngSize(`docs/play-store/assets/screenshots/qa-360x640/${name}.png`), [360, 640]);
}

const pages = ['index.html', 'privacy.html', 'terms.html', 'support.html']
  .map((name) => text(`docs/public/${name}`));
for (const page of pages) {
  assert.match(page, /<meta name="viewport"/);
  assert.match(page, /privacy\.html/);
  assert.match(page, /terms\.html/);
  assert.match(page, /support\.html/);
  assert.doesNotMatch(page, /TBD|TODO|REPLACE_WITH|\[(?:COMPANY|CONTACT_EMAIL|JURISDICTION)\]/);
}

const privacy = text('docs/public/privacy.html');
assert.match(privacy, /RevenueCat/);
assert.match(privacy, /purchase history/);
assert.match(privacy, /dehbkoclugu@gmail\.com/);
const terms = text('docs/public/terms.html');
for (const edition of ['Yorumsuz Türkçe Çeviri', 'World English Bible', 'Reina-Valera 1909', 'Bíblia Livre', 'Ostervald', 'Luther Bible 1912']) {
  assert.match(terms, new RegExp(edition));
}

const declarations = text('docs/play-store/play-console-declarations.md');
assert.match(declarations, /Purchase history/);
assert.match(declarations, /16 KB/);
assert.match(declarations, /target SDK ≥35/);
const screenshots = text('docs/play-store/screenshots.md');
for (const requirement of ['360×640', '390×844', 'Today', 'Bible', 'Prayer', 'Journal', 'Plus']) {
  assert.match(screenshots, new RegExp(requirement));
}

const pagesWorkflow = text('.github/workflows/legal-pages.yml');
assert.match(pagesWorkflow, /pages: write/);
assert.match(pagesWorkflow, /id-token: write/);
assert.match(pagesWorkflow, /path: docs\/public/);
const screenshotWorkflow = text('.github/workflows/play-store-screenshots.yml');
assert.match(screenshotWorkflow, /permissions:\n  contents: read/);
assert.match(screenshotWorkflow, /play-store-screenshots/);
assert.match(text('scripts/capture-play-screens.mjs'), /page\.screenshot/);

console.log('Google Play launch kit: OK');
