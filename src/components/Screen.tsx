import React from 'react';
import { Image, ScrollView, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/theme/tokens';
import { artRegistry } from '@/assets/registry';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  /** extra bottom padding for tab bar screens */
  tabbed?: boolean;
}

const grain = artRegistry['A3-grain'];

/** Fixed, non-scrolling film-grain wash (A3) — sits above bg, below content. */
function Grain() {
  if (!grain) return null;
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.04 }}
    >
      <Image
        source={grain}
        resizeMode="repeat"
        accessibilityIgnoresInvertColors
        style={{ width: '100%', height: '100%' }}
      />
    </View>
  );
}

export function Screen({ children, scroll = true, style, tabbed = false }: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const base: ViewStyle = {
    flex: 1,
    backgroundColor: t.bg,
  };
  const content: ViewStyle = {
    paddingTop: insets.top + spacing.xl,
    paddingHorizontal: spacing.xl,
    // The native tab bar sits below the content area (it doesn't overlap), so
    // tabbed screens only need a normal bottom margin — the old 96px reserve
    // left a long empty gap under every screen.
    paddingBottom: tabbed ? spacing.xxl : insets.bottom + spacing.xxl,
    // keep phone-width composition on web/tablet
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  };
  return (
    <View style={base}>
      <Grain />
      {scroll ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[content, style]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[content, { flex: 1 }, style]}>{children}</View>
      )}
    </View>
  );
}
