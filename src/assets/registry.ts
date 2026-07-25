import type { ImageSourcePropType } from 'react-native';

/**
 * Art asset registry — single connection point for finished artwork.
 * An ArtSlot renders finished art when its id maps to a require() below,
 * otherwise a labeled placeholder. See docs/asset-briefs.md.
 */
export type AssetId =
  | 'A1-logomark'
  | 'A4-welcome-hero'
  | 'A5-verse-peace'
  | 'A5-verse-strength'
  | 'A5-verse-trust'
  | 'A5-verse-rest'
  | 'A5-verse-hope'
  | 'A5-verse-guidance'
  | 'A5-verse-joy'
  | 'A5-verse-love'
  | 'A6-affirmation-spot'
  | 'A7-plan-crest'
  | 'A8-paywall-hero'
  | 'A9-thanks-sharing'
  | 'A10-tonight-night'
  | 'A11-morning'
  | 'A11-anxiety'
  | 'A11-gratitude'
  | 'A11-sleep'
  | 'A11-family'
  | 'A11-strength'
  | 'A12-journal-empty'
  | 'A13-plan-cover'
  | 'A13-peace7'
  | 'A13-gratitude7'
  | 'A13-psalms30'
  | 'A13-gospels90'
  | 'A13-bible365'
  | 'A14-bible-etching'
  | 'A15-building-candle';

export const artRegistry: Record<AssetId, ImageSourcePropType | null> = {
  'A1-logomark': require('./art/A1-logomark.png'),
  'A4-welcome-hero': require('./art/A4-welcome-hero.png'),
  'A5-verse-peace': require('./art/A5-verse-peace.png'),
  'A5-verse-strength': require('./art/A5-verse-strength.png'),
  'A5-verse-trust': require('./art/A5-verse-trust.png'),
  'A5-verse-rest': require('./art/A5-verse-rest.png'),
  'A5-verse-hope': require('./art/A5-verse-hope.png'),
  'A5-verse-guidance': require('./art/A5-verse-guidance.png'),
  'A5-verse-joy': require('./art/A5-verse-joy.png'),
  'A5-verse-love': require('./art/A5-verse-love.png'),
  'A6-affirmation-spot': require('./art/A6-affirmation-spot.png'),
  'A7-plan-crest': require('./art/A7-plan-crest.png'),
  'A8-paywall-hero': require('./art/A8-paywall-hero.png'),
  'A9-thanks-sharing': require('./art/A9-thanks-sharing.png'),
  'A10-tonight-night': require('./art/A10-tonight-night.png'),
  'A11-morning': require('./art/A11-morning.png'),
  'A11-anxiety': require('./art/A11-anxiety.png'),
  'A11-gratitude': require('./art/A11-gratitude.png'),
  'A11-sleep': require('./art/A11-sleep.png'),
  'A11-family': require('./art/A11-family.png'),
  'A11-strength': require('./art/A11-strength.png'),
  'A12-journal-empty': require('./art/A12-journal-empty.png'),
  'A13-plan-cover': require('./art/A13-plan-cover.png'),
  'A13-peace7': require('./art/A13-peace7.png'),
  'A13-gratitude7': require('./art/A13-gratitude7.png'),
  'A13-psalms30': require('./art/A13-psalms30.png'),
  'A13-gospels90': require('./art/A13-gospels90.png'),
  'A13-bible365': require('./art/A13-bible365.png'),
  'A14-bible-etching': require('./art/A14-bible-etching.png'),
  // Reuse the existing candle-lit affirmation until a dedicated crop is commissioned.
  'A15-building-candle': require('./art/A6-affirmation-spot.png'),
};

/** Placeholder metadata shown inside unfilled slots. */
export const artSpecs: Record<AssetId, { label: string; size: string }> = {
  'A1-logomark': { label: 'Logomark', size: '512²' },
  'A4-welcome-hero': { label: 'Welcome hero', size: '1170×1000' },
  'A5-verse-peace': { label: 'Verse — peace', size: '1170×1300' },
  'A5-verse-strength': { label: 'Verse — strength', size: '1170×1300' },
  'A5-verse-trust': { label: 'Verse — trust', size: '1170×1300' },
  'A5-verse-rest': { label: 'Verse — rest', size: '1170×1300' },
  'A5-verse-hope': { label: 'Verse — hope', size: '1170×1300' },
  'A5-verse-guidance': { label: 'Verse — guidance', size: '1170×1300' },
  'A5-verse-joy': { label: 'Verse — joy', size: '1170×1300' },
  'A5-verse-love': { label: 'Verse — love', size: '1170×1300' },
  'A6-affirmation-spot': { label: 'Affirmation', size: '600²' },
  'A7-plan-crest': { label: 'Plan crest', size: '720²' },
  'A8-paywall-hero': { label: 'Paywall hero', size: '1170×900' },
  'A9-thanks-sharing': { label: 'Thanks', size: '900²' },
  'A10-tonight-night': { label: 'Tonight', size: '1170×700' },
  'A11-morning': { label: 'Morning', size: '720²' },
  'A11-anxiety': { label: 'Anxiety', size: '720²' },
  'A11-gratitude': { label: 'Gratitude', size: '720²' },
  'A11-sleep': { label: 'Sleep', size: '720²' },
  'A11-family': { label: 'Family', size: '720²' },
  'A11-strength': { label: 'Strength', size: '720²' },
  'A12-journal-empty': { label: 'Journal empty', size: '720²' },
  'A13-plan-cover': { label: 'Plan cover', size: '1170×700' },
  'A13-peace7': { label: 'Peace plan', size: '1170×700' },
  'A13-gratitude7': { label: 'Gratitude plan', size: '1170×700' },
  'A13-psalms30': { label: 'Psalms plan', size: '1170×700' },
  'A13-gospels90': { label: 'Gospels plan', size: '1170×700' },
  'A13-bible365': { label: 'Bible plan', size: '1170×700' },
  'A14-bible-etching': { label: 'Bible etching', size: '1170×400' },
  'A15-building-candle': { label: 'Building candle', size: '600²' },
};

/** Verse-card background art keyed by verse theme; falls back to peace. */
const verseArtByTheme: Record<string, AssetId> = {
  peace: 'A5-verse-peace',
  strength: 'A5-verse-strength',
  trust: 'A5-verse-trust',
  rest: 'A5-verse-rest',
  hope: 'A5-verse-hope',
  guidance: 'A5-verse-guidance',
  joy: 'A5-verse-joy',
  love: 'A5-verse-love',
  // themes without dedicated art borrow a kindred scene
  anxiety: 'A5-verse-rest',
  comfort: 'A5-verse-rest',
  gratitude: 'A5-verse-joy',
  faith: 'A5-verse-hope',
  forgiveness: 'A5-verse-hope',
};

export function verseArt(theme: string): AssetId {
  return verseArtByTheme[theme] ?? 'A5-verse-peace';
}

/** Prayer-category tile art keyed by category. */
export function categoryArt(cat: string): AssetId | null {
  const map: Record<string, AssetId> = {
    morning: 'A11-morning',
    anxiety: 'A11-anxiety',
    gratitude: 'A11-gratitude',
    sleep: 'A11-sleep',
    family: 'A11-family',
    strength: 'A11-strength',
  };
  return map[cat] ?? null;
}

/** Reading-plan cover art keyed by plan id; falls back to the generic cover. */
export function planArt(planId: string): AssetId {
  const map: Record<string, AssetId> = {
    'peace-7': 'A13-peace7',
    'gratitude-7': 'A13-gratitude7',
    'psalms-30': 'A13-psalms30',
    'gospels-90': 'A13-gospels90',
    'bible-365': 'A13-bible365',
  };
  return map[planId] ?? 'A13-plan-cover';
}
