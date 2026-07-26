import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  SCRIPTURE_SOURCES,
  RELEASE_BLOCKED_LOCALES,
  claimsFreeRights,
  isRightsVerified,
} from './scriptureRights.ts';
import { translations } from '../i18n/translations.ts';

const LOCALES = ['tr', 'en', 'es', 'pt', 'fr', 'de'] as const;

test('every bundled locale has a rights record with evidence', () => {
  for (const locale of LOCALES) {
    const source = SCRIPTURE_SOURCES[locale];
    assert.ok(source, `${locale} has no rights record`);
    assert.ok(source.edition.length > 0, `${locale} has no edition name`);
    assert.match(source.reviewed, /^\d{4}-\d{2}-\d{2}$/, `${locale} has no review date`);
    assert.ok(source.basis.length > 20, `${locale} has no stated basis`);
    assert.match(source.sourceUrl, /^https:\/\//, `${locale} has no source URL`);
  }
});

test('no unverified edition is presented as free to use', () => {
  for (const locale of LOCALES) {
    const source = SCRIPTURE_SOURCES[locale];
    if (source.status !== 'unverified') continue;
    assert.ok(
      !claimsFreeRights(source.credit),
      `${locale} credit claims free rights while unverified: ${source.credit}`,
    );
  }
});

test('the Turkish licensed edition keeps its attribution and license in the credit', () => {
  const tr = SCRIPTURE_SOURCES.tr;
  assert.equal(tr.status, 'licensed');
  assert.match(tr.credit, /İsmail Serinken/);
  assert.match(tr.credit, /CC BY-ND 4\.0/);
  assert.match(tr.conditions ?? '', /do not change the words or punctuation/);
});

test('an edition that states conditions also has them translatable', () => {
  // The screen shows the localized copy; the registry keeps the canonical English.
  // If one exists without the other, one of the two surfaces is silently empty.
  for (const locale of LOCALES) {
    const source = SCRIPTURE_SOURCES[locale];
    assert.equal(
      Boolean(source.conditions),
      Boolean(source.conditionsKey),
      `${locale}: conditions and conditionsKey must both be set or both absent`,
    );
  }
});

test('every locale now passes rights verification', () => {
  // Ostervald 1996 and the unidentified Almeida failed verification and were
  // replaced with editions carrying authoritative rights notices (item 10).
  assert.deepEqual(RELEASE_BLOCKED_LOCALES, []);
  for (const locale of LOCALES) {
    assert.equal(isRightsVerified(locale), true, `${locale} should be verified`);
  }
});

test('the replaced editions are the verified ones, not the rejected ones', () => {
  const fr = SCRIPTURE_SOURCES.fr;
  assert.equal(fr.status, 'public-domain');
  assert.doesNotMatch(fr.edition, /1996/, 'French must not be back on the 1996 revision');
  assert.match(fr.sourceUrl, /ebible\.org\/fra_fob/);

  const pt = SCRIPTURE_SOURCES.pt;
  assert.equal(pt.status, 'licensed');
  assert.match(pt.edition, /Bíblia Livre/);
  assert.equal(pt.license, 'CC BY 4.0');
  assert.match(pt.sourceUrl, /ebible\.org\/porbr2018/);
});

test('the credit shown to users matches the bundled edition', () => {
  // The generators freeze a credit into each JSON. Display goes through the
  // registry, so the two must not drift apart unnoticed.
  for (const locale of LOCALES) {
    const bundled = JSON.parse(readFileSync(`src/data/bible-full.${locale}.json`, 'utf8'));
    assert.equal(
      SCRIPTURE_SOURCES[locale].credit,
      bundled.credit,
      `${locale} registry credit and bundled credit disagree`,
    );
  }
});

test('the text source screen is reachable and renders the registry', () => {
  // Roadmap item 12: the one-line credit is an entry point, not the disclosure.
  // Licensed editions require the copyright, license and version to be reachable.
  const screen = readFileSync('app/source.tsx', 'utf8');
  for (const shown of [
    'SCRIPTURE_SOURCES',
    'source.copyright',
    'source.license',
    'source.version',
    'source.conditions',
    'source.reviewed',
    'source.openLicense',
    'source.openSource',
  ]) {
    assert.ok(screen.includes(shown), `the source screen must surface ${shown}`);
  }
  // Every bundled edition, not only the active one.
  assert.match(screen, /SUPPORTED_LOCALES\.filter/);

  const sheet = readFileSync('src/components/ReadingSettingsSheet.tsx', 'utf8');
  assert.match(sheet, /router\.push\('\/source'\)/, 'the reader settings must open the source screen');
  assert.match(sheet, /tr\('read\.textSource'\)/);

  const tab = readFileSync('app/(tabs)/bible.tsx', 'utf8');
  assert.match(tab, /router\.push\('\/source'\)/, 'the credit must open the source screen');

  const layout = readFileSync('app/_layout.tsx', 'utf8');
  assert.match(layout, /name="source"/, 'the source route must be registered');
});

test('every locale carries its own source-screen wording', () => {
  // A licensed edition's attribution must be readable in the reader's language,
  // not silently fall back to English.
  const keys = [
    'read.textSource',
    'source.title',
    'source.intro',
    'source.current',
    'source.otherEditions',
    'source.copyright',
    'source.license',
    'source.conditions',
    'source.version',
    'source.reviewed',
    'source.publicDomain',
    'source.licensed',
    'source.openLicense',
    'source.openSource',
  ] as const;
  // Words that are legitimately spelled the same as English in some languages, so
  // matching the English string is not evidence of a missing translation.
  const sharedWording = new Set(['source.version']);

  // Every edition that states conditions must state them in all six languages.
  const conditionKeys = [...new Set(
    LOCALES.map((l) => SCRIPTURE_SOURCES[l].conditionsKey).filter(Boolean),
  )] as string[];
  assert.ok(conditionKeys.length >= 3, 'expected conditions for the licensed and trademarked editions');
  for (const locale of LOCALES) {
    const dict = translations[locale] as Record<string, string>;
    for (const key of conditionKeys) {
      assert.ok(dict[key], `${locale} is missing ${key}`);
      if (locale !== 'en') {
        assert.notEqual(
          dict[key],
          (translations.en as Record<string, string>)[key],
          `${locale}.${key} is still the English string`,
        );
      }
    }
  }

  for (const locale of LOCALES) {
    const dict = translations[locale] as Record<string, string>;
    for (const key of keys) {
      assert.ok(dict[key], `${locale} is missing ${key}`);
      if (locale !== 'en' && !sharedWording.has(key)) {
        assert.notEqual(
          dict[key],
          (translations.en as Record<string, string>)[key],
          `${locale}.${key} is still the English string`,
        );
      }
    }
  }
});

test('a free-rights credit appears only where the rights are public domain', () => {
  for (const locale of LOCALES) {
    const source = SCRIPTURE_SOURCES[locale];
    if (claimsFreeRights(source.credit)) {
      assert.equal(
        source.status,
        'public-domain',
        `${locale} claims free rights but is ${source.status}`,
      );
    }
  }
});

test('claimsFreeRights catches every localized free-rights wording', () => {
  for (const credit of [
    'World English Bible · Public Domain',
    'Reina-Valera 1909 · Dominio público',
    'João Ferreira de Almeida · Domínio público',
    'Bible Ostervald · Domaine public',
    'Lutherbibel 1912 · Gemeinfrei',
    'Bir çeviri · Kamu malı',
  ]) {
    assert.ok(claimsFreeRights(credit), `missed a free-rights claim: ${credit}`);
  }
  assert.equal(claimsFreeRights('Bible Ostervald 1996 · Droits en cours de vérification'), false);
});
