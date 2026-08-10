import assert from 'node:assert/strict';
import test from 'node:test';
import {
  APPLICATION_CONTENT_PACK_SCHEMA_VERSION,
  DEVOTIONAL_CONTENT_IDS,
  PLAN_CONTENT_IDS,
  PRAYER_CONTENT_IDS,
  QUIZ_CONTENT_REQUIREMENTS,
  type ApplicationContentPack,
} from '../data/applicationContentPack.ts';
import {
  clearRegisteredApplicationContentPacks,
  getRegisteredApplicationContentPack,
  registerApplicationContentPack,
} from './applicationContent.ts';

function pack(locale: ApplicationContentPack['locale']): ApplicationContentPack {
  return {
    schemaVersion: APPLICATION_CONTENT_PACK_SCHEMA_VERSION,
    locale,
    version: '1.0.0',
    reviewStatus: 'release-candidate',
    quiz: QUIZ_CONTENT_REQUIREMENTS.map((step) => ({
      key: step.key,
      question: `${locale} ${step.key}`,
      options: step.optionValues.map((value) => ({ value, label: `${locale} ${value}` })),
    })),
    prayers: PRAYER_CONTENT_IDS.map((id) => ({ id, title: `${locale} ${id}`, script: ['Amen.'] })),
    devotionals: DEVOTIONAL_CONTENT_IDS.map((id) => ({
      id,
      title: `${locale} ${id}`,
      body: `${locale} body`,
      prayer: `${locale} prayer`,
    })),
    plans: PLAN_CONTENT_IDS.map((id) => ({ id, title: `${locale} ${id}`, tagline: `${locale} tagline` })),
  };
}

test('registers only complete validated application content packs', () => {
  clearRegisteredApplicationContentPacks();
  registerApplicationContentPack(pack('fr'));
  assert.equal(getRegisteredApplicationContentPack('fr')?.locale, 'fr');

  const broken = pack('de');
  broken.prayers.pop();
  assert.throws(() => registerApplicationContentPack(broken), /prayer ids/);
  assert.equal(getRegisteredApplicationContentPack('de'), null);
});

test('never returns another locale as a field-level fallback', () => {
  clearRegisteredApplicationContentPacks();
  registerApplicationContentPack(pack('fr'));
  assert.equal(getRegisteredApplicationContentPack('fr')?.locale, 'fr');
  assert.equal(getRegisteredApplicationContentPack('de'), null);
});
