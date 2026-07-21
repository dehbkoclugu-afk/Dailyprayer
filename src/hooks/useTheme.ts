import { useColorScheme } from 'react-native';
import { themes, type ThemeColors, type ThemeName } from '@/theme/tokens';
import { useUserStore } from '@/state/useUserStore';

export function useTheme(): ThemeColors {
  const system = useColorScheme();
  const pref = useUserStore((s) => s.themePreference);
  const name: ThemeName =
    pref === 'system' ? (system === 'light' ? 'dawn' : 'vigil') : pref;
  return themes[name];
}
