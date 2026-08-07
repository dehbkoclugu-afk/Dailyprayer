import { useColorScheme } from 'react-native';
import { themes, type ThemeColors, type ThemeName } from '@/theme/tokens';
import { useUserStore } from '@/state/useUserStore';

export function useTheme(): ThemeColors {
  const name = useThemeName();
  return themes[name];
}

/** Active visual mode, shared by theme tokens and artwork treatment. */
export function useThemeName(): ThemeName {
  const system = useColorScheme();
  const pref = useUserStore((s) => s.themePreference);
  return pref === 'system' ? (system === 'light' ? 'dawn' : 'vigil') : pref;
}
