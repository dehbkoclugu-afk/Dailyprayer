import React from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useThemeName } from '@/hooks/useTheme';
import { grainOpacity, spacing } from '@/theme/tokens';
import { artRegistry } from '@/assets/registry';
import { contentMaxWidth } from '@/lib/adaptiveLayout';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  /** extra bottom padding for tab bar screens */
  tabbed?: boolean;
  /** Keep focused fields and their primary CTA above the software keyboard. */
  keyboardAware?: boolean;
}

const grain = artRegistry['A3-grain'];

function Grain() {
  const themeName = useThemeName();
  if (!grain) return null;
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: grainOpacity[themeName] }}
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

export function Screen({ children, scroll = true, style, tabbed = false, keyboardAware = false }: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const safeTop = Math.max(
    insets.top,
    Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0,
  );
  const base: ViewStyle = {
    flex: 1,
    backgroundColor: t.bg,
  };
  const content: ViewStyle = {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    // Tab screens already reserve space for the navigator. Adding another
    // tab-bar-sized inset leaves an obvious empty block under the last card.
    paddingBottom: tabbed ? spacing.xxl : insets.bottom + spacing.xl,
    // Keep a readable devotional measure while giving large-text/tablet layouts room.
    width: '100%',
    maxWidth: contentMaxWidth(width),
    alignSelf: 'center',
  };
  const body = scroll ? (
    <ScrollView
      style={{ flex: 1, marginTop: safeTop }}
      contentContainerStyle={[content, style]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[content, { flex: 1, marginTop: safeTop }, style]}>{children}</View>
  );

  return (
    <View style={base}>
      <Grain />
      {keyboardAware ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={safeTop}
        >
          {body}
        </KeyboardAvoidingView>
      ) : body}
    </View>
  );
}
