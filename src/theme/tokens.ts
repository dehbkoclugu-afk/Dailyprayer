export type ThemeName = 'vigil' | 'dawn';

export interface ThemeColors {
  bg: string;
  surface: string;
  surfaceAlt: string;
  /** tab bar / bottom chrome — one step darker than surface */
  chrome: string;
  ink: string;
  inkSoft: string;
  inkFaint: string;
  gold: string;
  /**
   * Gold that passes 4.5:1 as text (roadmap item 32).
   *
   * The brand gold is a decorative colour and reads as one: at #B8860B on the
   * light theme's surfaces it measures 2.79:1, so every gold eyebrow, PLUS badge
   * and metadata line on Dawn was below the threshold for body text — and those
   * are the smallest strings in the app. Borders, icons, fills and large display
   * type keep `gold`; anything that has to be *read* uses this.
   */
  goldText: string;
  goldSoft: string;
  onGold: string;
  blue: string;
  success: string;
  danger: string;
  border: string;
  /** verse-card gradient stops */
  duskFrom: string;
  duskTo: string;
}

export const themes: Record<ThemeName, ThemeColors> = {
  vigil: {
    bg: '#0E1220',
    surface: '#171C2E',
    surfaceAlt: '#1F2740',
    chrome: '#12172A',
    ink: '#F2EEE6',
    inkSoft: '#A9A698',
    inkFaint: '#9A9890',
    gold: '#D9A441',
    // Already 6.56:1 at worst on the dark surfaces, so text and decoration agree.
    goldText: '#D9A441',
    goldSoft: '#2E2718',
    onGold: '#1A1206',
    blue: '#7C9CD9',
    success: '#7FB58A',
    danger: '#D97B6C',
    border: '#262D45',
    duskFrom: '#2B2352',
    duskTo: '#0E1220',
  },
  dawn: {
    bg: '#FBF7F0',
    surface: '#FFFFFF',
    surfaceAlt: '#F3EDE2',
    chrome: '#F6F1E7',
    ink: '#221E19',
    inkSoft: '#6E675C',
    inkFaint: '#6B6459',
    // Darkened from #B8860B, which measured 2.79:1 on surfaceAlt — below even the
    // 3:1 large-text threshold this colour is kept for, so the drop cap and the
    // gold icons were failing too, not just the copy. 3.45:1 at worst now.
    gold: '#A67609',
    // 4.71:1 at worst against surfaceAlt, the darkest of the light surfaces.
    goldText: '#8A6206',
    goldSoft: '#F5E7C8',
    onGold: '#FFFFFF',
    blue: '#4A6BAA',
    success: '#3E7C4F',
    danger: '#B0492F',
    border: '#E7DFD0',
    duskFrom: '#5B4A8A',
    duskTo: '#1E1B33',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

/**
 * Minimum touch target, in dp (roadmap item 21).
 *
 * Material requires 48×48; iOS asks for 44×44. We use 48 everywhere rather than
 * branching per platform — the larger target is never wrong, and one number is one
 * thing to remember.
 *
 * `hitSlop` alone does not count. It extends the touchable region but leaves the
 * visible control small, so the thing you can see and the thing you can hit are
 * different sizes — which is exactly what makes small controls feel unreliable.
 */
export const TAP_MIN = 48;

export const radius = {
  hero: 28,
  card: 24,
  inner: 16,
  pill: 999,
} as const;

export const shadow = {
  standard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 3,
  },
  hero: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  floating: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 12,
  },
  /** @deprecated Prefer the explicit standard/hero/floating role. */
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 3,
  },
} as const;

export const artwork = {
  onArtwork: '#F2EEE6',
  onArtworkSoft: '#C9C5B8',
  sacredGold: '#D9A441',
  onSacredGold: '#1A1206',
} as const;
export const scrim = {
  top: ['rgba(10,12,24,0.2)', 'rgba(10,12,24,0.78)'] as const,
  center: ['rgba(23,16,46,0.58)', 'rgba(14,18,32,0.88)'] as const,
  strong: ['rgba(23,16,46,0.82)', 'rgba(14,18,32,0.97)'] as const,
} as const;
export const interaction = { pressed: 0.72, disabled: 0.38, focus: 0.86 } as const;
export const motion = { sharedAxis: 280, fadeThrough: 180, container: 320 } as const;
