import React from 'react';
import { ScrollView, useWindowDimensions, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/theme/tokens';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  /** extra bottom padding for tab bar screens */
  tabbed?: boolean;
}

export function Screen({ children, scroll = true, style, tabbed = false }: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const base: ViewStyle = {
    flex: 1,
    backgroundColor: t.bg,
  };
  const content: ViewStyle = {
    paddingTop: insets.top + spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingBottom: (tabbed ? 96 : insets.bottom + spacing.xl) + spacing.xl,
    // Keep a readable devotional measure while giving large-text/tablet layouts room.
    width: '100%',
    maxWidth: width >= 840 ? 640 : 480,
    alignSelf: 'center',
  };
  if (!scroll) return <View style={[base, content, style]}>{children}</View>;
  return (
    <ScrollView
      style={base}
      contentContainerStyle={[content, style]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}
