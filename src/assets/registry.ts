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
  | 'A4-welcome-hero'
  | 'A5-verse-peace'
  | 'A6-affirmation-spot'
  | 'A7-plan-crest'
  | 'A8-paywall-hero'
  | 'A9-thanks-sharing'
  | 'A10-tonight-night'
  | 'A12-journal-empty'
  | 'A13-plan-cover'
  | 'A15-building-candle';

export const artRegistry: Record<AssetId, ImageSourcePropType | null> = {
  'A1-logomark': require('./art/A1-logomark.png'),
  'A4-welcome-hero': require('./art/A4-welcome-hero.png'),
  'A5-verse-peace': require('./art/A5-verse-peace.png'),
  'A6-affirmation-spot': require('./art/A6-affirmation-spot.png'),
  'A7-plan-crest': require('./art/A7-plan-crest.png'),
  'A8-paywall-hero': require('./art/A8-paywall-hero.png'),
  'A9-thanks-sharing': require('./art/A9-thanks-sharing.png'),
  'A10-tonight-night': require('./art/A10-tonight-night.png'),
  'A12-journal-empty': require('./art/A12-journal-empty.png'),
  'A13-plan-cover': require('./art/A13-plan-cover.png'),
  'A15-building-candle': null,
};

/** Placeholder metadata shown inside unfilled slots (matches asset briefs). */
export const artSpecs: Record<AssetId, { label: string; size: string }> = {
  'A1-logomark': { label: 'Logomark', size: '512×512 PNG (transparent)' },
  'A4-welcome-hero': { label: 'Welcome hero', size: '1170×1000 PNG' },
  'A5-verse-peace': { label: 'Verse art — peace', size: '1170×1300 PNG' },
  'A6-affirmation-spot': { label: 'Affirmation spot', size: '600×600 PNG (transparent)' },
  'A7-plan-crest': { label: 'Plan crest', size: '720×720 PNG (transparent)' },
  'A8-paywall-hero': { label: 'Paywall hero', size: '1170×900 PNG' },
  'A9-thanks-sharing': { label: 'Thanks — sharing light', size: '900×900 PNG (transparent)' },
  'A10-tonight-night': { label: 'Tonight night sky', size: '1170×700 PNG' },
  'A12-journal-empty': { label: 'Journal empty state', size: '720×720 PNG (transparent)' },
  'A13-plan-cover': { label: 'Plan cover', size: '1170×700 PNG' },
  'A15-building-candle': { label: 'Building candle', size: '600×600 PNG (transparent)' },
};
