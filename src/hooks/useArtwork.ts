import type { ImageSourcePropType } from 'react-native';
import { themedArtRegistry, type AssetId } from '@/assets/registry';
import { useThemeName } from '@/hooks/useTheme';

const VIGIL_FOREGROUND = {
  primary: '#F7F1E7',
  secondary: 'rgba(247,241,231,0.78)',
  tertiary: 'rgba(247,241,231,0.60)',
  badge: 'rgba(247,241,231,0.14)',
} as const;

const DAWN_FOREGROUND = {
  primary: '#221E19',
  secondary: 'rgba(34,30,25,0.76)',
  tertiary: 'rgba(34,30,25,0.58)',
  badge: 'rgba(34,30,25,0.10)',
} as const;

/** Theme-resolved artwork source + contrast-safe foreground palette. */
export function useArtwork() {
  const scheme = useThemeName();
  return {
    scheme,
    foreground: scheme === 'dawn' ? DAWN_FOREGROUND : VIGIL_FOREGROUND,
    source: (id: AssetId): ImageSourcePropType | undefined =>
      themedArtRegistry[id]?.[scheme],
  };
}
