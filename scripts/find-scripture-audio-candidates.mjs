/**
 * Find public-domain Scripture audio candidates for locales Lumen already ships text for.
 *
 * eBible.org publishes one directory per translation and, where a recording exists,
 * a sibling `mp3/` directory using the deterministic `<BOOKCODE><NN>.mp3` naming that
 * `src/services/publicDomainAudioProviders.ts` already resolves without scraping HTML.
 * This script enumerates the eBible catalogue, keeps the translations whose language
 * matches a Lumen locale, then probes each one for audio and reads its copyright page.
 *
 * Usage:  node scripts/find-scripture-audio-candidates.mjs [--locale tr] [--json]
 *
 * Network: reaches ebible.org directly. Run it somewhere with egress to that host;
 * a restricted proxy will surface as "catalogue unavailable".
 */

const CATALOGUE_URL = 'https://ebible.org/Scriptures/translations.csv';
const SITE = 'https://ebible.org';

/** Lumen locale → ISO 639-3 codes eBible may file the translation under. */
const LOCALE_LANGUAGES = {
  ar: ['arb', 'ara'], my: ['mya'], cek: ['cek'], hlt: ['hlt'],
  'zh-Hans': ['cmn'], 'zh-Hant': ['cmn'], hr: ['hrv'], cs: ['ces'],
  nl: ['nld'], en: ['eng'], eo: ['epo'], fr: ['fra'], de: ['deu'],
  ht: ['hat'], haw: ['haw'], it: ['ita'], ja: ['jpn'], ko: ['kor'],
  kos: ['kos'], la: ['lat'], ulk: ['ulk'], fa: ['pes', 'fas'], pt: ['por'],
  ro: ['ron'], ru: ['rus'], 'sr-Latn': ['srp'], 'sr-Cyrl': ['srp'],
  es: ['spa'], sw: ['swh', 'swa'], to: ['ton'], uk: ['ukr'], vi: ['vie'],
  sq: ['sqi', 'als'], bg: ['bul'], da: ['dan'], fi: ['fin'], hu: ['hun'],
  lv: ['lvs', 'lav'], mi: ['mri'], no: ['nob', 'nor'], pl: ['pol'],
  sv: ['swe'], tl: ['tgl'], th: ['tha'], tr: ['tur'],
};

/** Locales that already have a wired audio source — reported, not re-proposed. */
const ALREADY_WIRED = new Set(['en', 'tr', 'es', 'fr', 'de', 'ja']);

/** A licence is only worth wiring if the recording may be redistributed commercially. */
const PERMISSIVE = [
  /public domain/i, /\bPD\b/, /CC0/i, /gemeinfrei/i,
  /Creative Commons Attribution(?!.*NonCommercial)/i, /\bCC[ -]BY(?![ -]?NC)/i,
];
const RESTRICTED = [/NonCommercial/i, /\bNC\b/, /all rights reserved/i, /©\s*\d{4}/];

function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') { row.push(field); field = ''; }
    else if (char === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (char !== '\r') field += char;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const header = rows.shift() ?? [];
  return rows
    .filter((entry) => entry.length >= header.length - 1 && entry.some(Boolean))
    .map((entry) => Object.fromEntries(header.map((name, index) => [name.trim(), (entry[index] ?? '').trim()])));
}

function classify(copyrightText) {
  if (!copyrightText) return 'unknown';
  if (RESTRICTED.some((pattern) => pattern.test(copyrightText))
    && !PERMISSIVE.some((pattern) => pattern.test(copyrightText))) return 'restricted';
  if (PERMISSIVE.some((pattern) => pattern.test(copyrightText))) return 'permissive';
  return 'unknown';
}

async function head(url) {
  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return response.ok;
  } catch {
    return false;
  }
}

async function licenceOf(id) {
  try {
    const response = await fetch(`${SITE}/${id}/copyright.htm`);
    if (!response.ok) return { verdict: 'unknown', note: `copyright.htm HTTP ${response.status}` };
    const text = (await response.text())
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const note = (text.match(/[^.]*(?:public domain|Creative Commons|CC BY[^.]*|gemeinfrei|copyright)[^.]*\./i)?.[0] ?? text.slice(0, 160)).trim();
    return { verdict: classify(text), note };
  } catch (error) {
    return { verdict: 'unknown', note: error.message };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const onlyLocale = args.includes('--locale') ? args[args.indexOf('--locale') + 1] : null;
  const asJson = args.includes('--json');

  const response = await fetch(CATALOGUE_URL).catch((error) => ({ ok: false, statusText: error.message }));
  if (!response.ok) {
    console.error(`eBible catalogue unavailable: ${response.status ?? ''} ${response.statusText ?? ''}`.trim());
    process.exit(2);
  }
  const catalogue = parseCsv(await response.text());

  const wanted = Object.entries(LOCALE_LANGUAGES)
    .filter(([locale]) => !onlyLocale || locale === onlyLocale);
  const results = [];

  for (const [locale, codes] of wanted) {
    const matches = catalogue.filter((entry) => codes.includes(entry.languageCode));
    for (const entry of matches) {
      const id = entry.translationId;
      if (!id) continue;
      if (!(await head(`${SITE}/${id}/mp3/MAT01.mp3`)) && !(await head(`${SITE}/${id}/mp3/`))) continue;
      const licence = await licenceOf(id);
      results.push({
        locale,
        alreadyWired: ALREADY_WIRED.has(locale),
        translationId: id,
        title: entry.title || entry.shortTitle || '',
        licence: licence.verdict,
        evidence: `${SITE}/${id}/copyright.htm`,
        note: licence.note,
      });
    }
  }

  results.sort((a, b) => Number(a.alreadyWired) - Number(b.alreadyWired)
    || a.licence.localeCompare(b.licence) || a.locale.localeCompare(b.locale));

  if (asJson) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  if (!results.length) {
    console.log('No eBible translation with an mp3/ directory matched a Lumen locale.');
    return;
  }
  console.log(`${results.length} candidate recording(s):\n`);
  for (const item of results) {
    const flag = item.alreadyWired ? 'wired' : item.licence;
    console.log(`  [${flag.padEnd(10)}] ${item.locale.padEnd(8)} ${item.translationId.padEnd(14)} ${item.title}`);
    console.log(`  ${' '.repeat(13)} ${item.evidence}`);
    if (item.note) console.log(`  ${' '.repeat(13)} ${item.note.slice(0, 150)}`);
    console.log();
  }
  const fresh = results.filter((item) => !item.alreadyWired && item.licence === 'permissive');
  console.log(`Permissive and not yet wired: ${fresh.length} → ${fresh.map((item) => item.locale).join(', ') || 'none'}`);
  console.log('Every hit still needs a human licence read before shipping; this only narrows the field.');
}

await main();
