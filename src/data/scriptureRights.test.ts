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

test('French and Portuguese are release-blocked pending rights verification', () => {
  assert.deepEqual([...RELEASE_BLOCKED_LOCALES].sort(), ['fr', 'pt']);
  assert.equal(isRightsVerified('fr'), false);
  assert.equal(isRightsVerified('pt'), false);
  for (const locale of ['tr', 'en', 'es', 'de'] as const) {
    assert.equal(isRightsVerified(locale), true, `${locale} should be verified`);
  }
});

test('the French record names the 1996 reviser and publisher it traces to', () => {
  const fr = SCRIPTURE_SOURCES.fr;
  assert.match(fr.edition, /Ostervald 1996/);
  assert.match(fr.basis, /Boughman/);
  assert.match(fr.basis, /Bearing Precious Seed/);
});

test('the registry overrides the stale free-rights claim frozen in Scripture JSON', () => {
  // The bundled JSON is immutable source data, so the false claim stays on disk;
  // what matters is that the app never reads it. Both halves are asserted here.
  for (const locale of RELEASE_BLOCKED_LOCALES) {
    const bundled = JSON.parse(readFileSync(`src/data/bible-full.${locale}.json`, 'utf8'));
    assert.ok(
      claimsFreeRights(bundled.credit),
      `expected the stale JSON claim for ${locale}; if it is gone, drop this override`,
    );
    assert.notEqual(SCRIPTURE_SOURCES[locale].credit, bundled.credit);
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
