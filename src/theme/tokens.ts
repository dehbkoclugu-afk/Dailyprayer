export type ThemeName = 'vigil' | 'dawn';

export interface ThemeColors {
  bg: string;
  surface: string;
  surfaceAlt: string;
  ink: string;
  inkSoft: string;
  inkFaint: string;
  gold: string;
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
    ink: '#F2EEE6',
    inkSoft: '#A9A698',
    inkFaint: '#6C6B63',
    gold: '#D9A441',
    goldSoft: '#3A3020',
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
    ink: '#221E19',
    inkSoft: '#6E675C',
    inkFaint: '#9C948A',
    gold: '#B8860B',
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

export const radius = {
  card: 24,
  inner: 16,
  pill: 999,
} as const;

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;
