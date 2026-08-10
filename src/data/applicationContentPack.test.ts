import assert from 'node:assert/strict';
import test from 'node:test';
import {
  APPLICATION_CONTENT_PACK_SCHEMA_VERSION,
  DEVOTIONAL_CONTENT_IDS,
  PLAN_CONTENT_IDS,
  PRAYER_CONTENT_IDS,
  QUIZ_CONTENT_REQUIREMENTS,
  validateApplicationContentPack,
  type ApplicationContentPack,
} from './applicationContentPack.ts';

function validPack(locale = 'en'): ApplicationContentPack {
  return {
    schemaVersion: APPLICATION_CONTENT_PACK_SCHEMA_VERSION,
    locale: locale as ApplicationContentPack['locale'],
    version: '1.0.0',
    reviewStatus: 'release-candidate',
    quiz: QUIZ_CONTENT_REQUIREMENTS.map((step) => ({
      key: step.key,
      question: `Question ${step.key}`,
      subtitle: `Subtitle ${step.key}`,
      options: step.optionValues.map((value) => ({ value, label: `Label ${value}` })),
    })),
    prayers: PRAYER_CONTENT_IDS.map((id) => ({
      id,
      title: `Prayer ${id}`,
      script: ['Opening', 'Prayer', 'Amen.'],
    })),
    devotionals: DEVOTIONAL_CONTENT_IDS.map((id) => ({
      id,
      title: `Devotional ${id}`,
      body: 'Devotional body.',
      prayer: 'Closing prayer. Amen.',
    })),
    plans: PLAN_CONTENT_IDS.map((id) => ({
      id,
      title: `Plan ${id}`,
      tagline: `Plan tagline ${id}`,
    })),
  };
}

test('accepts a complete first-party application content pack', () => {
  assert.equal(validateApplicationContentPack(validPack(), 'en').locale, 'en');
});

test('rejects an application content pack for the wrong locale', () => {
  assert.throws(
    () => validateApplicationContentPack(validPack(), 'fr'),
    /locale mismatch/,
  );
});

test('rejects missing and duplicate stable content ids', () => {
  const missing = validPack();
  missing.prayers.pop();
  assert.throws(() => validateApplicationContentPack(missing, 'en'), /prayer ids/);

  const duplicate = validPack();
  duplicate.plans[1]!.id = duplicate.plans[0]!.id;
  assert.throws(() => validateApplicationContentPack(duplicate, 'en'), /plan ids/);
});

test('rejects missing quiz options and blank translated strings', () => {
  const missingOption = validPack();
  missingOption.quiz[0]!.options.pop();
  assert.throws(() => validateApplicationContentPack(missingOption, 'en'), /quiz options/);

  const blank = validPack();
  blank.devotionals[0]!.body = '   ';
  assert.throws(() => validateApplicationContentPack(blank, 'en'), /body/);
});

test('rejects packs that attempt to carry Scripture payloads', () => {
  const pack = validPack() as ApplicationContentPack & { books?: unknown };
  pack.books = [];
  assert.throws(() => validateApplicationContentPack(pack, 'en'), /forbidden Scripture field/);
});
