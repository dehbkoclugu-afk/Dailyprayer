import { APPLICATION_LOCALE_CANDIDATES } from '../i18n/applicationLocales.ts';
import type { GlobalLocaleTag } from '../i18n/globalLanguageCatalog.ts';

export const APPLICATION_CONTENT_PACK_SCHEMA_VERSION = 1 as const;

export type ApplicationContentLocale = Exclude<
  GlobalLocaleTag,
  'bg' | 'th' | 'ulk' | 'sw'
>;

export const PRAYER_CONTENT_IDS = [
  'morning-light',
  'calm-the-storm',
  'grateful-heart',
  'into-rest',
  'bless-my-family',
  'courage-for-today',
  'gratitude-evening',
  'still-waters',
  'morning-surrender',
  'peace-of-christ',
  'gratitude-morning',
  'rest-for-the-weary',
  'for-my-children',
  'strength-to-forgive',
  'sleep-psalm',
  'when-i-am-weak',
  'thankful-in-hard-times',
] as const;

export const DEVOTIONAL_CONTENT_IDS = Array.from(
  { length: 24 },
  (_, index) => `devotional-${String(index + 1).padStart(3, '0')}`,
);

export const PLAN_CONTENT_IDS = [
  'peace-7',
  'gratitude-7',
  'psalms-30',
  'gospels-90',
  'bible-365',
] as const;

export const QUIZ_CONTENT_REQUIREMENTS = [
  {
    key: 'tradition',
    optionValues: ['catholic', 'protestant', 'orthodox', 'nondenominational', 'exploring'],
  },
  {
    key: 'goals',
    optionValues: ['habit', 'closer', 'peace', 'sleep', 'bible', 'gratitude'],
  },
  {
    key: 'struggles',
    optionValues: ['anxiety', 'loneliness', 'grief', 'direction', 'consistency', 'none'],
  },
  { key: 'experience', optionValues: ['new', 'returning', 'regular'] },
  { key: 'prayerTime', optionValues: ['07:30', '12:30', '21:00', 'none'] },
] as const;

export interface ApplicationContentQuizStep {
  key: (typeof QUIZ_CONTENT_REQUIREMENTS)[number]['key'];
  question: string;
  subtitle?: string;
  affirmation?: string;
  options: { value: string; label: string }[];
}

export interface ApplicationContentPrayer {
  id: string;
  title: string;
  script: string[];
}

export interface ApplicationContentDevotional {
  id: string;
  title: string;
  body: string;
  prayer: string;
}

export interface ApplicationContentPlan {
  id: string;
  title: string;
  tagline: string;
}

export interface ApplicationContentPack {
  schemaVersion: typeof APPLICATION_CONTENT_PACK_SCHEMA_VERSION;
  locale: ApplicationContentLocale;
  version: string;
  reviewStatus: 'release-candidate' | 'reviewed';
  quiz: ApplicationContentQuizStep[];
  prayers: ApplicationContentPrayer[];
  devotionals: ApplicationContentDevotional[];
  plans: ApplicationContentPlan[];
}

export interface ApplicationContentRelease {
  locale: ApplicationContentLocale;
  version: string;
  bytes: number;
  sha256: string;
  downloadUrl: string;
}

const allowedLocales = new Set<string>(
  APPLICATION_LOCALE_CANDIDATES.map((locale) => locale.tag),
);
const forbiddenScriptureFields = new Set([
  'books',
  'chapters',
  'verseText',
  'scriptureText',
]);

function objectValue(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
}

function nonEmptyString(value: unknown, label: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Application content pack has invalid ${label}`);
  }
  return value;
}

function assertNoScriptureFields(value: unknown): void {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach(assertNoScriptureFields);
    return;
  }
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (forbiddenScriptureFields.has(key)) {
      throw new Error(`Application content pack has forbidden Scripture field: ${key}`);
    }
    assertNoScriptureFields(child);
  }
}

function assertExactIds(
  values: unknown,
  expected: readonly string[],
  label: string,
): Record<string, unknown>[] {
  if (!Array.isArray(values)) throw new Error(`Application content pack ${label} must be an array`);
  const entries = values.map((value, index) => objectValue(value, `${label}[${index}]`));
  const ids = entries.map((entry) => nonEmptyString(entry.id, `${label} id`));
  const unique = new Set(ids);
  if (
    ids.length !== expected.length ||
    unique.size !== ids.length ||
    expected.some((id) => !unique.has(id))
  ) {
    throw new Error(`Application content pack ${label} ids are incomplete or invalid`);
  }
  return entries;
}

function validateQuiz(value: unknown): void {
  if (!Array.isArray(value)) throw new Error('Application content pack quiz must be an array');
  const steps = value.map((step, index) => objectValue(step, `quiz[${index}]`));
  const stepMap = new Map(steps.map((step) => [nonEmptyString(step.key, 'quiz key'), step]));
  if (stepMap.size !== QUIZ_CONTENT_REQUIREMENTS.length) {
    throw new Error('Application content pack quiz keys are incomplete or invalid');
  }

  for (const requirement of QUIZ_CONTENT_REQUIREMENTS) {
    const step = stepMap.get(requirement.key);
    if (!step) throw new Error('Application content pack quiz keys are incomplete or invalid');
    nonEmptyString(step.question, `quiz ${requirement.key} question`);
    if (step.subtitle !== undefined) nonEmptyString(step.subtitle, `quiz ${requirement.key} subtitle`);
    if (step.affirmation !== undefined) {
      nonEmptyString(step.affirmation, `quiz ${requirement.key} affirmation`);
    }
    if (!Array.isArray(step.options)) {
      throw new Error(`Application content pack quiz options are invalid for ${requirement.key}`);
    }
    const options = step.options.map((option, index) =>
      objectValue(option, `quiz ${requirement.key} option[${index}]`),
    );
    const values = options.map((option) => nonEmptyString(option.value, 'quiz option value'));
    const unique = new Set(values);
    if (
      values.length !== requirement.optionValues.length ||
      unique.size !== values.length ||
      requirement.optionValues.some((option) => !unique.has(option))
    ) {
      throw new Error(`Application content pack quiz options are invalid for ${requirement.key}`);
    }
    options.forEach((option) => nonEmptyString(option.label, 'quiz option label'));
  }
}

export function validateApplicationContentPack(
  value: unknown,
  expectedLocale?: ApplicationContentLocale,
): ApplicationContentPack {
  assertNoScriptureFields(value);
  const pack = objectValue(value, 'Application content pack');

  if (pack.schemaVersion !== APPLICATION_CONTENT_PACK_SCHEMA_VERSION) {
    throw new Error(`Unsupported application content schema: ${String(pack.schemaVersion)}`);
  }
  const locale = nonEmptyString(pack.locale, 'locale');
  if (!allowedLocales.has(locale)) throw new Error(`Unsupported application content locale: ${locale}`);
  if (expectedLocale && locale !== expectedLocale) {
    throw new Error(`Application content locale mismatch: ${locale}`);
  }
  nonEmptyString(pack.version, 'version');
  if (pack.reviewStatus !== 'release-candidate' && pack.reviewStatus !== 'reviewed') {
    throw new Error(`Invalid application content review status: ${String(pack.reviewStatus)}`);
  }

  validateQuiz(pack.quiz);

  const prayers = assertExactIds(pack.prayers, PRAYER_CONTENT_IDS, 'prayer');
  prayers.forEach((prayer) => {
    nonEmptyString(prayer.title, 'prayer title');
    if (!Array.isArray(prayer.script) || prayer.script.length === 0) {
      throw new Error('Application content pack has invalid prayer script');
    }
    prayer.script.forEach((line) => nonEmptyString(line, 'prayer script line'));
  });

  const devotionals = assertExactIds(pack.devotionals, DEVOTIONAL_CONTENT_IDS, 'devotional');
  devotionals.forEach((devotional) => {
    nonEmptyString(devotional.title, 'devotional title');
    nonEmptyString(devotional.body, 'devotional body');
    nonEmptyString(devotional.prayer, 'devotional prayer');
  });

  const plans = assertExactIds(pack.plans, PLAN_CONTENT_IDS, 'plan');
  plans.forEach((plan) => {
    nonEmptyString(plan.title, 'plan title');
    nonEmptyString(plan.tagline, 'plan tagline');
  });

  return pack as unknown as ApplicationContentPack;
}
