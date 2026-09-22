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
  | 'A22-journal-compose'
  | 'A22-journal-gratitude'
  | 'A22-journal-verse'
  | 'A24-prayer-morning-light'
  | 'A24-prayer-calm-the-storm'
  | 'A24-prayer-grateful-heart'
  | 'A24-prayer-into-rest'
  | 'A24-prayer-bless-my-family'
  | 'A24-prayer-courage-for-today'
  | 'A24-prayer-gratitude-evening'
  | 'A24-prayer-still-waters'
  | 'A24-prayer-morning-surrender'
  | 'A24-prayer-peace-of-christ'
  | 'A24-prayer-gratitude-morning'
  | 'A24-prayer-rest-for-the-weary'
  | 'A24-prayer-for-my-children'
  | 'A24-prayer-strength-to-forgive'
  | 'A24-prayer-sleep-psalm'
  | 'A24-prayer-when-i-am-weak'
  | 'A24-prayer-thankful-in-hard-times';

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
  'A22-journal-compose': require('./art/A22-journal-compose.webp'),
  'A22-journal-gratitude': require('./art/A22-journal-gratitude.webp'),
  'A22-journal-verse': require('./art/A22-journal-verse.webp'),
  'A24-prayer-morning-light': require('./art/A24-prayer-morning-light-dawn.webp'),
  'A24-prayer-calm-the-storm': require('./art/A24-prayer-calm-the-storm-dawn.webp'),
  'A24-prayer-grateful-heart': require('./art/A24-prayer-grateful-heart-dawn.webp'),
  'A24-prayer-into-rest': require('./art/A24-prayer-into-rest-dawn.webp'),
  'A24-prayer-bless-my-family': require('./art/A24-prayer-bless-my-family-dawn.webp'),
  'A24-prayer-courage-for-today': require('./art/A24-prayer-courage-for-today-dawn.webp'),
  'A24-prayer-gratitude-evening': require('./art/A24-prayer-gratitude-evening-dawn.webp'),
  'A24-prayer-still-waters': require('./art/A24-prayer-still-waters-dawn.webp'),
  'A24-prayer-morning-surrender': require('./art/A24-prayer-morning-surrender-dawn.webp'),
  'A24-prayer-peace-of-christ': require('./art/A24-prayer-peace-of-christ-dawn.webp'),
  'A24-prayer-gratitude-morning': require('./art/A24-prayer-gratitude-morning-dawn.webp'),
  'A24-prayer-rest-for-the-weary': require('./art/A24-prayer-rest-for-the-weary-dawn.webp'),
  'A24-prayer-for-my-children': require('./art/A24-prayer-for-my-children-dawn.webp'),
  'A24-prayer-strength-to-forgive': require('./art/A24-prayer-strength-to-forgive-dawn.webp'),
  'A24-prayer-sleep-psalm': require('./art/A24-prayer-sleep-psalm-dawn.webp'),
  'A24-prayer-when-i-am-weak': require('./art/A24-prayer-when-i-am-weak-dawn.webp'),
  'A24-prayer-thankful-in-hard-times': require('./art/A24-prayer-thankful-in-hard-times-dawn.webp'),
};

/**
 * Theme-aware artwork registry, mirroring Neurosound's dark/light art-pair
 * contract. Legacy slots share one source where appropriate; newer content art
 * can provide separately lit Dawn/Vigil files without changing consumers.
 */
export type ArtworkPair = {
  vigil: ImageSourcePropType;
  dawn: ImageSourcePropType;
};

const baseThemedArtRegistry = Object.fromEntries(
  (Object.entries(artRegistry) as [AssetId, ImageSourcePropType | null][]).map(([id, source]) => [
    id,
    source ? { vigil: source, dawn: source } : null,
  ]),
) as Record<AssetId, ArtworkPair | null>;

export const themedArtRegistry: Record<AssetId, ArtworkPair | null> = {
  ...baseThemedArtRegistry,
  'A5-verse-peace': { dawn: require('./art/A5-verse-peace-dawn.webp'), vigil: require('./art/A5-verse-peace.webp') },
  'A5-verse-strength': { dawn: require('./art/A5-verse-strength-dawn.webp'), vigil: require('./art/A5-verse-strength.webp') },
  'A5-verse-trust': { dawn: require('./art/A5-verse-trust-dawn.webp'), vigil: require('./art/A5-verse-trust.webp') },
  'A5-verse-rest': { dawn: require('./art/A5-verse-rest-dawn.webp'), vigil: require('./art/A5-verse-rest.webp') },
  'A5-verse-hope': { dawn: require('./art/A5-verse-hope-dawn.webp'), vigil: require('./art/A5-verse-hope.webp') },
  'A5-verse-guidance': { dawn: require('./art/A5-verse-guidance-dawn.webp'), vigil: require('./art/A5-verse-guidance.webp') },
  'A5-verse-joy': { dawn: require('./art/A5-verse-joy-dawn.webp'), vigil: require('./art/A5-verse-joy.webp') },
  'A5-verse-love': { dawn: require('./art/A5-verse-love-dawn.webp'), vigil: require('./art/A5-verse-love.webp') },
  'A24-prayer-morning-light': { dawn: require('./art/A24-prayer-morning-light-dawn.webp'), vigil: require('./art/A24-prayer-morning-light-vigil.webp') },
  'A24-prayer-calm-the-storm': { dawn: require('./art/A24-prayer-calm-the-storm-dawn.webp'), vigil: require('./art/A24-prayer-calm-the-storm-vigil.webp') },
  'A24-prayer-grateful-heart': { dawn: require('./art/A24-prayer-grateful-heart-dawn.webp'), vigil: require('./art/A24-prayer-grateful-heart-vigil.webp') },
  'A24-prayer-into-rest': { dawn: require('./art/A24-prayer-into-rest-dawn.webp'), vigil: require('./art/A24-prayer-into-rest-vigil.webp') },
  'A24-prayer-bless-my-family': { dawn: require('./art/A24-prayer-bless-my-family-dawn.webp'), vigil: require('./art/A24-prayer-bless-my-family-vigil.webp') },
  'A24-prayer-courage-for-today': { dawn: require('./art/A24-prayer-courage-for-today-dawn.webp'), vigil: require('./art/A24-prayer-courage-for-today-vigil.webp') },
  'A24-prayer-gratitude-evening': { dawn: require('./art/A24-prayer-gratitude-evening-dawn.webp'), vigil: require('./art/A24-prayer-gratitude-evening-vigil.webp') },
  'A24-prayer-still-waters': { dawn: require('./art/A24-prayer-still-waters-dawn.webp'), vigil: require('./art/A24-prayer-still-waters-vigil.webp') },
  'A24-prayer-morning-surrender': { dawn: require('./art/A24-prayer-morning-surrender-dawn.webp'), vigil: require('./art/A24-prayer-morning-surrender-vigil.webp') },
  'A24-prayer-peace-of-christ': { dawn: require('./art/A24-prayer-peace-of-christ-dawn.webp'), vigil: require('./art/A24-prayer-peace-of-christ-vigil.webp') },
  'A24-prayer-gratitude-morning': { dawn: require('./art/A24-prayer-gratitude-morning-dawn.webp'), vigil: require('./art/A24-prayer-gratitude-morning-vigil.webp') },
  'A24-prayer-rest-for-the-weary': { dawn: require('./art/A24-prayer-rest-for-the-weary-dawn.webp'), vigil: require('./art/A24-prayer-rest-for-the-weary-vigil.webp') },
  'A24-prayer-for-my-children': { dawn: require('./art/A24-prayer-for-my-children-dawn.webp'), vigil: require('./art/A24-prayer-for-my-children-vigil.webp') },
  'A24-prayer-strength-to-forgive': { dawn: require('./art/A24-prayer-strength-to-forgive-dawn.webp'), vigil: require('./art/A24-prayer-strength-to-forgive-vigil.webp') },
  'A24-prayer-sleep-psalm': { dawn: require('./art/A24-prayer-sleep-psalm-dawn.webp'), vigil: require('./art/A24-prayer-sleep-psalm-vigil.webp') },
  'A24-prayer-when-i-am-weak': { dawn: require('./art/A24-prayer-when-i-am-weak-dawn.webp'), vigil: require('./art/A24-prayer-when-i-am-weak-vigil.webp') },
  'A24-prayer-thankful-in-hard-times': { dawn: require('./art/A24-prayer-thankful-in-hard-times-dawn.webp'), vigil: require('./art/A24-prayer-thankful-in-hard-times-vigil.webp') },
};

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
  'A22-journal-compose': { label: 'Journal: compose', size: '1440×810' },
  'A22-journal-gratitude': { label: 'Journal: gratitude', size: '1440×810' },
  'A22-journal-verse': { label: 'Journal: verse', size: '1440×810' },
  'A24-prayer-morning-light': { label: 'Prayer: Morning Light', size: '960×640' },
  'A24-prayer-calm-the-storm': { label: 'Prayer: Calm the Storm', size: '960×640' },
  'A24-prayer-grateful-heart': { label: 'Prayer: Grateful Heart', size: '960×640' },
  'A24-prayer-into-rest': { label: 'Prayer: Into Rest', size: '960×640' },
  'A24-prayer-bless-my-family': { label: 'Prayer: Bless My Family', size: '960×640' },
  'A24-prayer-courage-for-today': { label: 'Prayer: Courage for Today', size: '960×640' },
  'A24-prayer-gratitude-evening': { label: 'Prayer: Gratitude Evening', size: '960×640' },
  'A24-prayer-still-waters': { label: 'Prayer: Still Waters', size: '960×640' },
  'A24-prayer-morning-surrender': { label: 'Prayer: Morning Surrender', size: '960×640' },
  'A24-prayer-peace-of-christ': { label: 'Prayer: Peace of Christ', size: '960×640' },
  'A24-prayer-gratitude-morning': { label: 'Prayer: Gratitude Morning', size: '960×640' },
  'A24-prayer-rest-for-the-weary': { label: 'Prayer: Rest for the Weary', size: '960×640' },
  'A24-prayer-for-my-children': { label: 'Prayer: For My Children', size: '960×640' },
  'A24-prayer-strength-to-forgive': { label: 'Prayer: Strength to Forgive', size: '960×640' },
  'A24-prayer-sleep-psalm': { label: 'Prayer: Sleep Psalm', size: '960×640' },
  'A24-prayer-when-i-am-weak': { label: 'Prayer: When I Am Weak', size: '960×640' },
  'A24-prayer-thankful-in-hard-times': { label: 'Prayer: Thankful in Hard Times', size: '960×640' },
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

/** Every guided prayer owns a distinct Dawn/Vigil art pair; no category reuse. */
export function prayerArt(prayerId: string): AssetId {
  const map: Record<string, AssetId> = {
    'morning-light': 'A24-prayer-morning-light',
    'calm-the-storm': 'A24-prayer-calm-the-storm',
    'grateful-heart': 'A24-prayer-grateful-heart',
    'into-rest': 'A24-prayer-into-rest',
    'bless-my-family': 'A24-prayer-bless-my-family',
    'courage-for-today': 'A24-prayer-courage-for-today',
    'gratitude-evening': 'A24-prayer-gratitude-evening',
    'still-waters': 'A24-prayer-still-waters',
    'morning-surrender': 'A24-prayer-morning-surrender',
    'peace-of-christ': 'A24-prayer-peace-of-christ',
    'gratitude-morning': 'A24-prayer-gratitude-morning',
    'rest-for-the-weary': 'A24-prayer-rest-for-the-weary',
    'for-my-children': 'A24-prayer-for-my-children',
    'strength-to-forgive': 'A24-prayer-strength-to-forgive',
    'sleep-psalm': 'A24-prayer-sleep-psalm',
    'when-i-am-weak': 'A24-prayer-when-i-am-weak',
    'thankful-in-hard-times': 'A24-prayer-thankful-in-hard-times',
  };
  return map[prayerId] ?? 'A19-ritual-prayer';
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
