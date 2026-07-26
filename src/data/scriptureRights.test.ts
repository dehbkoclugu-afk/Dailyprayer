import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  SCRIPTURE_SOURCES,
  RELEASE_BLOCKED_LOCALES,
  claimsFreeRights,
  isRightsVerified,
} from './scriptureRights.ts';

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
