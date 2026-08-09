import type { ImageSourcePropType } from 'react-native';

type Scheme = 'dawn' | 'vigil';
type Pair = { dawn: ImageSourcePropType; vigil: ImageSourcePropType };
type PlanArtwork = { days: number; pool: Pair[] };

/**
 * Curated reading-plan artwork pool.
 *
 * Each scene has a matching Dawn/Vigil composition. Short plans use one scene per
 * day; long plans cycle their own curated pool to keep the bundle compact without
 * falling back to procedural placeholder art.
 */
const PEACE_ART: Pair[] = [
  { dawn: require('./art/plan-curated/peace-7-001-dawn.webp'), vigil: require('./art/plan-curated/peace-7-001-vigil.webp') },
  { dawn: require('./art/plan-curated/peace-7-002-dawn.webp'), vigil: require('./art/plan-curated/peace-7-002-vigil.webp') },
  { dawn: require('./art/plan-curated/peace-7-003-dawn.webp'), vigil: require('./art/plan-curated/peace-7-003-vigil.webp') },
  { dawn: require('./art/plan-curated/peace-7-004-dawn.webp'), vigil: require('./art/plan-curated/peace-7-004-vigil.webp') },
  { dawn: require('./art/plan-curated/peace-7-005-dawn.webp'), vigil: require('./art/plan-curated/peace-7-005-vigil.webp') },
  { dawn: require('./art/plan-curated/peace-7-006-dawn.webp'), vigil: require('./art/plan-curated/peace-7-006-vigil.webp') },
  { dawn: require('./art/plan-curated/peace-7-007-dawn.webp'), vigil: require('./art/plan-curated/peace-7-007-vigil.webp') },
];

const GRATITUDE_ART: Pair[] = [
  { dawn: require('./art/plan-curated/gratitude-7-001-dawn.webp'), vigil: require('./art/plan-curated/gratitude-7-001-vigil.webp') },
  { dawn: require('./art/plan-curated/gratitude-7-002-dawn.webp'), vigil: require('./art/plan-curated/gratitude-7-002-vigil.webp') },
  { dawn: require('./art/plan-curated/gratitude-7-003-dawn.webp'), vigil: require('./art/plan-curated/gratitude-7-003-vigil.webp') },
  { dawn: require('./art/plan-curated/gratitude-7-004-dawn.webp'), vigil: require('./art/plan-curated/gratitude-7-004-vigil.webp') },
  { dawn: require('./art/plan-curated/gratitude-7-005-dawn.webp'), vigil: require('./art/plan-curated/gratitude-7-005-vigil.webp') },
  { dawn: require('./art/plan-curated/gratitude-7-006-dawn.webp'), vigil: require('./art/plan-curated/gratitude-7-006-vigil.webp') },
  { dawn: require('./art/plan-curated/gratitude-7-007-dawn.webp'), vigil: require('./art/plan-curated/gratitude-7-007-vigil.webp') },
];

const PSALMS_ART: Pair[] = [
  { dawn: require('./art/plan-curated/psalms-01-dawn.webp'), vigil: require('./art/plan-curated/psalms-01-vigil.webp') },
  { dawn: require('./art/plan-curated/psalms-02-dawn.webp'), vigil: require('./art/plan-curated/psalms-02-vigil.webp') },
  { dawn: require('./art/plan-curated/psalms-03-dawn.webp'), vigil: require('./art/plan-curated/psalms-03-vigil.webp') },
  { dawn: require('./art/plan-curated/psalms-04-dawn.webp'), vigil: require('./art/plan-curated/psalms-04-vigil.webp') },
  { dawn: require('./art/plan-curated/psalms-05-dawn.webp'), vigil: require('./art/plan-curated/psalms-05-vigil.webp') },
  { dawn: require('./art/plan-curated/psalms-06-dawn.webp'), vigil: require('./art/plan-curated/psalms-06-vigil.webp') },
  { dawn: require('./art/plan-curated/psalms-07-dawn.webp'), vigil: require('./art/plan-curated/psalms-07-vigil.webp') },
  { dawn: require('./art/plan-curated/psalms-08-dawn.webp'), vigil: require('./art/plan-curated/psalms-08-vigil.webp') },
  { dawn: require('./art/plan-curated/psalms-09-dawn.webp'), vigil: require('./art/plan-curated/psalms-09-vigil.webp') },
  { dawn: require('./art/plan-curated/psalms-10-dawn.webp'), vigil: require('./art/plan-curated/psalms-10-vigil.webp') },
];

const GOSPELS_ART: Pair[] = [
  { dawn: require('./art/plan-curated/gospels-01-dawn.webp'), vigil: require('./art/plan-curated/gospels-01-vigil.webp') },
  { dawn: require('./art/plan-curated/gospels-02-dawn.webp'), vigil: require('./art/plan-curated/gospels-02-vigil.webp') },
  { dawn: require('./art/plan-curated/gospels-03-dawn.webp'), vigil: require('./art/plan-curated/gospels-03-vigil.webp') },
  { dawn: require('./art/plan-curated/gospels-04-dawn.webp'), vigil: require('./art/plan-curated/gospels-04-vigil.webp') },
  { dawn: require('./art/plan-curated/gospels-05-dawn.webp'), vigil: require('./art/plan-curated/gospels-05-vigil.webp') },
  { dawn: require('./art/plan-curated/gospels-06-dawn.webp'), vigil: require('./art/plan-curated/gospels-06-vigil.webp') },
  { dawn: require('./art/plan-curated/gospels-07-dawn.webp'), vigil: require('./art/plan-curated/gospels-07-vigil.webp') },
  { dawn: require('./art/plan-curated/gospels-08-dawn.webp'), vigil: require('./art/plan-curated/gospels-08-vigil.webp') },
  { dawn: require('./art/plan-curated/gospels-09-dawn.webp'), vigil: require('./art/plan-curated/gospels-09-vigil.webp') },
  { dawn: require('./art/plan-curated/gospels-10-dawn.webp'), vigil: require('./art/plan-curated/gospels-10-vigil.webp') },
  { dawn: require('./art/plan-curated/gospels-11-dawn.webp'), vigil: require('./art/plan-curated/gospels-11-vigil.webp') },
  { dawn: require('./art/plan-curated/gospels-12-dawn.webp'), vigil: require('./art/plan-curated/gospels-12-vigil.webp') },
  { dawn: require('./art/plan-curated/gospels-13-dawn.webp'), vigil: require('./art/plan-curated/gospels-13-vigil.webp') },
];

const BIBLE_ART: Pair[] = [
  { dawn: require('./art/plan-curated/bible-01-dawn.webp'), vigil: require('./art/plan-curated/bible-01-vigil.webp') },
  { dawn: require('./art/plan-curated/bible-02-dawn.webp'), vigil: require('./art/plan-curated/bible-02-vigil.webp') },
  { dawn: require('./art/plan-curated/bible-03-dawn.webp'), vigil: require('./art/plan-curated/bible-03-vigil.webp') },
  { dawn: require('./art/plan-curated/bible-04-dawn.webp'), vigil: require('./art/plan-curated/bible-04-vigil.webp') },
  { dawn: require('./art/plan-curated/bible-05-dawn.webp'), vigil: require('./art/plan-curated/bible-05-vigil.webp') },
  { dawn: require('./art/plan-curated/bible-06-dawn.webp'), vigil: require('./art/plan-curated/bible-06-vigil.webp') },
  { dawn: require('./art/plan-curated/bible-07-dawn.webp'), vigil: require('./art/plan-curated/bible-07-vigil.webp') },
  { dawn: require('./art/plan-curated/bible-08-dawn.webp'), vigil: require('./art/plan-curated/bible-08-vigil.webp') },
  { dawn: require('./art/plan-curated/bible-09-dawn.webp'), vigil: require('./art/plan-curated/bible-09-vigil.webp') },
  { dawn: require('./art/plan-curated/bible-10-dawn.webp'), vigil: require('./art/plan-curated/bible-10-vigil.webp') },
  { dawn: require('./art/plan-curated/bible-11-dawn.webp'), vigil: require('./art/plan-curated/bible-11-vigil.webp') },
  { dawn: require('./art/plan-curated/bible-12-dawn.webp'), vigil: require('./art/plan-curated/bible-12-vigil.webp') },
  { dawn: require('./art/plan-curated/bible-13-dawn.webp'), vigil: require('./art/plan-curated/bible-13-vigil.webp') },
];

const PLAN_ART: Record<string, PlanArtwork> = {
  'peace-7': { days: 7, pool: PEACE_ART },
  'gratitude-7': { days: 7, pool: GRATITUDE_ART },
  'psalms-30': { days: 30, pool: PSALMS_ART },
  'gospels-90': { days: 90, pool: GOSPELS_ART },
  'bible-365': { days: 365, pool: BIBLE_ART },
};

export function planDayArtSource(planId: string, dayIndex: number, scheme: Scheme): ImageSourcePropType | null {
  const artwork = PLAN_ART[planId];
  if (!artwork || !Number.isInteger(dayIndex) || dayIndex < 0 || dayIndex >= artwork.days) return null;

  return artwork.pool[dayIndex % artwork.pool.length]?.[scheme] ?? null;
}

