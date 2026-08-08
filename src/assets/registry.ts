import type { ImageSourcePropType } from 'react-native';

/**
 * Art asset registry , single connection point for finished artwork.
 * An ArtSlot renders finished art when its id maps to a require() below,
 * otherwise a labeled placeholder. See docs/asset-briefs.md.
 */
export type AssetId =
  | 'A1-logomark'
  | 'A2-wordmark'
  | 'A3-grain'
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
  | 'A15-building-candle'
  | 'A17-splash'
  | 'A18-ritual-reading'
  | 'A19-ritual-prayer'
  | 'A20-ritual-gratitude'
  | 'A21-prayer-morning'
  | 'A21-prayer-anxiety'
  | 'A21-prayer-gratitude'
  | 'A21-prayer-sleep'
  | 'A21-prayer-family'
  | 'A21-prayer-strength'
  | 'A22-journal-compose'
  | 'A22-journal-gratitude'
  | 'A22-journal-verse'
  | 'A23-plan-row-01'
  | 'A23-plan-row-02'
  | 'A23-plan-row-03'
  | 'A23-plan-row-04'
  | 'A23-plan-row-05'
  | 'A23-plan-row-06'
  | 'A23-plan-row-07'
  | 'A23-plan-row-08';

export const artRegistry: Record<AssetId, ImageSourcePropType | null> = {
  'A1-logomark': require('./art/A1-logomark.webp'),
  'A2-wordmark': require('./art/A2-wordmark.webp'),
  'A3-grain': require('./art/A3-grain.webp'),
  'A4-welcome-hero': require('./art/A4-welcome-hero.webp'),
  'A5-verse-peace': require('./art/A5-verse-peace.webp'),
  'A5-verse-strength': require('./art/A5-verse-strength.webp'),
  'A5-verse-trust': require('./art/A5-verse-trust.webp'),
  'A5-verse-rest': require('./art/A5-verse-rest.webp'),
  'A5-verse-hope': require('./art/A5-verse-hope.webp'),
  'A5-verse-guidance': require('./art/A5-verse-guidance.webp'),
  'A5-verse-joy': require('./art/A5-verse-joy.webp'),
  'A5-verse-love': require('./art/A5-verse-love.webp'),
  'A6-affirmation-spot': require('./art/A6-affirmation-spot.webp'),
  'A7-plan-crest': require('./art/A7-plan-crest.webp'),
  'A8-paywall-hero': require('./art/A8-paywall-hero.webp'),
  'A9-thanks-sharing': require('./art/A9-thanks-sharing.webp'),
  'A10-tonight-night': require('./art/A10-tonight-night.webp'),
  'A11-morning': require('./art/A11-morning.webp'),
  'A11-anxiety': require('./art/A11-anxiety.webp'),
  'A11-gratitude': require('./art/A11-gratitude.webp'),
  'A11-sleep': require('./art/A11-sleep.webp'),
  'A11-family': require('./art/A11-family.webp'),
  'A11-strength': require('./art/A11-strength.webp'),
  'A12-journal-empty': require('./art/A12-journal-empty.webp'),
  'A13-plan-cover': require('./art/A13-plan-cover.webp'),
  'A13-peace7': require('./art/A13-peace7.webp'),
  'A13-gratitude7': require('./art/A13-gratitude7.webp'),
  'A13-psalms30': require('./art/A13-psalms30.webp'),
  'A13-gospels90': require('./art/A13-gospels90.webp'),
  'A13-bible365': require('./art/A13-bible365.webp'),
  'A14-bible-etching': require('./art/A14-bible-etching.webp'),
  'A15-building-candle': require('./art/A15-building-candle.webp'),
  'A17-splash': require('./art/A17-splash.webp'),
  'A18-ritual-reading': require('./art/A18-ritual-reading.webp'),
  'A19-ritual-prayer': require('./art/A19-ritual-prayer.webp'),
  'A20-ritual-gratitude': require('./art/A20-ritual-gratitude.webp'),
  'A21-prayer-morning': require('./art/A21-prayer-morning.webp'),
  'A21-prayer-anxiety': require('./art/A21-prayer-anxiety.webp'),
  'A21-prayer-gratitude': require('./art/A21-prayer-gratitude.webp'),
  'A21-prayer-sleep': require('./art/A21-prayer-sleep.webp'),
  'A21-prayer-family': require('./art/A21-prayer-family.webp'),
  'A21-prayer-strength': require('./art/A21-prayer-strength.webp'),
  'A22-journal-compose': require('./art/A22-journal-compose.webp'),
  'A22-journal-gratitude': require('./art/A22-journal-gratitude.webp'),
  'A22-journal-verse': require('./art/A22-journal-verse.webp'),
  'A23-plan-row-01': require('./art/A23-plan-row-01.webp'),
  'A23-plan-row-02': require('./art/A23-plan-row-02.webp'),
  'A23-plan-row-03': require('./art/A23-plan-row-03.webp'),
  'A23-plan-row-04': require('./art/A23-plan-row-04.webp'),
  'A23-plan-row-05': require('./art/A23-plan-row-05.webp'),
  'A23-plan-row-06': require('./art/A23-plan-row-06.webp'),
  'A23-plan-row-07': require('./art/A23-plan-row-07.webp'),
  'A23-plan-row-08': require('./art/A23-plan-row-08.webp'),
};

/**
 * Theme-aware artwork registry, mirroring Neurosound's dark/light art-pair
 * contract. Lumen intentionally keeps the same painterly source in Vigil and
 * Dawn; ArtSlot changes the scrim and foreground treatment instead. Individual
 * Dawn/Vigil files can be swapped in here later without touching consumers.
 */
export type ArtworkPair = {
  vigil: ImageSourcePropType;
  dawn: ImageSourcePropType;
};

export const themedArtRegistry = Object.fromEntries(
  (Object.entries(artRegistry) as [AssetId, ImageSourcePropType | null][]).map(([id, source]) => [
    id,
    source ? { vigil: source, dawn: source } : null,
  ]),
) as Record<AssetId, ArtworkPair | null>;

/** Placeholder metadata shown inside unfilled slots. */
export const artSpecs: Record<AssetId, { label: string; size: string }> = {
  'A1-logomark': { label: 'Logomark', size: '512²' },
  'A2-wordmark': { label: 'Wordmark', size: '1200×400' },
  'A3-grain': { label: 'Grain tile', size: '512²' },
  'A4-welcome-hero': { label: 'Welcome hero', size: '1170×1000' },
  'A5-verse-peace': { label: 'Verse , peace', size: '1170×1300' },
  'A5-verse-strength': { label: 'Verse , strength', size: '1170×1300' },
  'A5-verse-trust': { label: 'Verse , trust', size: '1170×1300' },
  'A5-verse-rest': { label: 'Verse , rest', size: '1170×1300' },
  'A5-verse-hope': { label: 'Verse , hope', size: '1170×1300' },
  'A5-verse-guidance': { label: 'Verse , guidance', size: '1170×1300' },
  'A5-verse-joy': { label: 'Verse , joy', size: '1170×1300' },
  'A5-verse-love': { label: 'Verse , love', size: '1170×1300' },
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
  'A17-splash': { label: 'Splash', size: '1284×2778' },
  'A18-ritual-reading': { label: 'Ritual: reading', size: '1980×800' },
  'A19-ritual-prayer': { label: 'Ritual: prayer', size: '1980×800' },
  'A20-ritual-gratitude': { label: 'Ritual: gratitude', size: '1980×800' },
  'A21-prayer-morning': { label: 'Prayer: morning', size: '1440×810' },
  'A21-prayer-anxiety': { label: 'Prayer: anxiety', size: '1440×810' },
  'A21-prayer-gratitude': { label: 'Prayer: gratitude', size: '1440×810' },
  'A21-prayer-sleep': { label: 'Prayer: sleep', size: '1440×810' },
  'A21-prayer-family': { label: 'Prayer: family', size: '1440×810' },
  'A21-prayer-strength': { label: 'Prayer: strength', size: '1440×810' },
  'A22-journal-compose': { label: 'Journal: compose', size: '1440×810' },
  'A22-journal-gratitude': { label: 'Journal: gratitude', size: '1440×810' },
  'A22-journal-verse': { label: 'Journal: verse', size: '1440×810' },
  'A23-plan-row-01': { label: 'Plan day: desert path', size: '1440×810' },
  'A23-plan-row-02': { label: 'Plan day: stream', size: '1440×810' },
  'A23-plan-row-03': { label: 'Plan day: stone steps', size: '1440×810' },
  'A23-plan-row-04': { label: 'Plan day: starlight', size: '1440×810' },
  'A23-plan-row-05': { label: 'Plan day: Galilee', size: '1440×810' },
  'A23-plan-row-06': { label: 'Plan day: wheat path', size: '1440×810' },
  'A23-plan-row-07': { label: 'Plan day: ravine', size: '1440×810' },
  'A23-plan-row-08': { label: 'Plan day: study', size: '1440×810' },
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
    morning: 'A21-prayer-morning',
    anxiety: 'A21-prayer-anxiety',
    gratitude: 'A21-prayer-gratitude',
    sleep: 'A21-prayer-sleep',
    family: 'A21-prayer-family',
    strength: 'A21-prayer-strength',
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

/** Reading-plan day rows rotate through distinct scenes instead of repeating the cover. */
const planRowArtIds: AssetId[] = [
  'A23-plan-row-01',
  'A23-plan-row-02',
  'A23-plan-row-03',
  'A23-plan-row-04',
  'A23-plan-row-05',
  'A23-plan-row-06',
  'A23-plan-row-07',
  'A23-plan-row-08',
];

const planRowOffsets: Record<string, number> = {
  'peace-7': 0,
  'gratitude-7': 2,
  'psalms-30': 4,
  'gospels-90': 6,
  'bible-365': 1,
};

export function planRowArt(planId: string, dayIndex: number): AssetId {
  const offset = planRowOffsets[planId] ?? 0;
  return planRowArtIds[(dayIndex + offset) % planRowArtIds.length];
}
