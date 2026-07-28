import { useTheme } from '@/hooks/useTheme';
import { useReaderPrefsStore } from '@/state/useReaderPrefsStore';
import type { ThemeColors } from '@/theme/tokens';

/**
 * Warm "paper" reading surface , a self-contained palette so the reading mode
 * reads like a printed page regardless of the app's light/dark theme.
 */
export const PAPER: Partial<ThemeColors> = {
  bg: '#F3E7CE',
  surface: '#EBDFC3',
  surfaceAlt: '#E3D5B6',
  ink: '#33291A',
  inkSoft: '#6E5F45',
  inkFaint: '#A08E6C',
  gold: '#94670F',
  goldSoft: '#E6D5A8',
  onGold: '#FFFFFF',
  border: '#D8C6A0',
};

/**
 * The palette the reader (and its sheets) should paint with: the paper override
 * folded over the app theme when paper mode is on, otherwise the app theme. Used
 * everywhere in the reading experience so opening a sheet over the paper page
 * doesn't flash a jarring dark surface.
 */
export function useReaderTheme(): ThemeColors {
  const t = useTheme();
  const paper = useReaderPrefsStore((s) => s.paper);
  return paper ? { ...t, ...PAPER } : t;
}
