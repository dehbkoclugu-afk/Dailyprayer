import type { ImageSourcePropType } from 'react-native';

/**
 * Art asset registry — single connection point for finished artwork.
 *
 * Workflow:
 *  1. Every ArtSlot in the UI names an AssetId below and renders a labeled
 *     placeholder while the entry is null.
 *  2. Generate the artwork with the briefs in docs/asset-briefs.md.
 *  3. Drop the file into src/assets/art/ using the exact filename from the
 *     brief (e.g. A4-welcome-hero.png).
 *  4. Replace `null` with `require('./art/A4-welcome-hero.png')`.
 * The placeholder disappears and the finished art renders everywhere.
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
  | 'A13-gratitude7'
  | 'A13-psalms30'
  | 'A13-gospels90'
  | 'A13-bible365'
  | 'A14-bible-etching'
  | 'A15-building-candle'
  | 'A17-splash';

export const artRegistry: Record<AssetId, ImageSourcePropType | null> = {
  'A1-logomark': require('./art/A1-logomark.png'),
  'A2-wordmark': require('./art/A2-wordmark.png'),
  'A3-grain': require('./art/A3-grain.png'),
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
  'A13-gratitude7': require('./art/A13-gratitude7.png'),
  'A13-psalms30': require('./art/A13-psalms30.png'),
  'A13-gospels90': require('./art/A13-gospels90.png'),
  'A13-bible365': require('./art/A13-bible365.png'),
  'A14-bible-etching': require('./art/A14-bible-etching.png'),
  'A15-building-candle': require('./art/A15-building-candle.png'),
  'A17-splash': require('./art/A17-splash.png'),
};

/** Placeholder metadata shown inside unfilled slots (matches asset briefs). */
export const artSpecs: Record<AssetId, { label: string; size: string }> = {
  'A1-logomark': { label: 'Logomark', size: '512×512 PNG (transparent)' },
  'A2-wordmark': { label: 'Wordmark', size: '1200×400 PNG (transparent)' },
  'A3-grain': { label: 'Grain tile', size: '512×512 PNG (transparent)' },
  'A4-welcome-hero': { label: 'Welcome hero', size: '1170×1000 PNG' },
  'A5-verse-peace': { label: 'Verse art — peace', size: '1170×1300 PNG' },
  'A5-verse-strength': { label: 'Verse art — strength', size: '1170×1300 PNG' },
  'A5-verse-trust': { label: 'Verse art — trust', size: '1170×1300 PNG' },
  'A5-verse-rest': { label: 'Verse art — rest', size: '1170×1300 PNG' },
  'A5-verse-hope': { label: 'Verse art — hope', size: '1170×1300 PNG' },
  'A5-verse-guidance': { label: 'Verse art — guidance', size: '1170×1300 PNG' },
  'A5-verse-joy': { label: 'Verse art — joy', size: '1170×1300 PNG' },
  'A5-verse-love': { label: 'Verse art — love', size: '1170×1300 PNG' },
  'A6-affirmation-spot': { label: 'Affirmation spot', size: '600×600 PNG (transparent)' },
  'A7-plan-crest': { label: 'Plan crest', size: '720×720 PNG (transparent)' },
  'A8-paywall-hero': { label: 'Paywall hero', size: '1170×900 PNG' },
  'A9-thanks-sharing': { label: 'Thanks — sharing light', size: '900×900 PNG (transparent)' },
  'A10-tonight-night': { label: 'Tonight night sky', size: '1170×700 PNG' },
  'A11-morning': { label: 'Prayer tile — morning', size: '720×720 PNG (transparent)' },
  'A11-anxiety': { label: 'Prayer tile — anxiety', size: '720×720 PNG (transparent)' },
  'A11-gratitude': { label: 'Prayer tile — gratitude', size: '720×720 PNG (transparent)' },
  'A11-sleep': { label: 'Prayer tile — sleep', size: '720×720 PNG (transparent)' },
  'A11-family': { label: 'Prayer tile — family', size: '720×720 PNG (transparent)' },
  'A11-strength': { label: 'Prayer tile — strength', size: '720×720 PNG (transparent)' },
  'A12-journal-empty': { label: 'Journal empty state', size: '720×720 PNG (transparent)' },
  'A13-plan-cover': { label: 'Plan cover — peace', size: '1170×700 PNG' },
  'A13-gratitude7': { label: 'Plan cover — gratitude', size: '1170×700 PNG' },
  'A13-psalms30': { label: 'Plan cover — psalms', size: '1170×700 PNG' },
  'A13-gospels90': { label: 'Plan cover — gospels', size: '1170×700 PNG' },
  'A13-bible365': { label: 'Plan cover — bible in a year', size: '1170×700 PNG' },
  'A14-bible-etching': { label: 'Bible header etching', size: '1170×400 PNG (transparent)' },
  'A15-building-candle': { label: 'Building candle', size: '600×600 PNG (transparent)' },
  'A17-splash': { label: 'Splash', size: '1284×2778 PNG' },
};
