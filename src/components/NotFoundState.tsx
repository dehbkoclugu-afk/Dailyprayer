import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { PillButton } from '@/components/PillButton';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/typography';
import { radius, spacing, TAP_MIN } from '@/theme/tokens';
import { useT } from '@/i18n';

/**
 * What a screen shows when the thing it was asked for does not exist
 * (roadmap item 19).
 *
 * The plan screens used to `return <View style={{ flex: 1, backgroundColor: t.bg }} />`
 * for an unknown id — a blank dark screen with no explanation and no affordance to
 * leave. A deep link that has gone stale is a normal thing to happen; it should
 * read as a small, calm dead end with a way out, not as the app breaking.
 *
 * Always gives two ways back: a named safe destination and plain "go back", since
 * a deep link opened from outside the app may have nothing to go back to.
 */
export function NotFoundState({
  title,
  body,
  actionLabel,
  onAction,
  icon = 'compass-outline',
}: {
  title: string;
  body: string;
  /** The named safe destination, e.g. "Reading plans". */
  actionLabel: string;
  onAction: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const t = useTheme();
  const { t: tr } = useT();

  return (
    <Screen scroll={false} style={{ justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', paddingHorizontal: spacing.md }}>
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: t.surfaceAlt,
            borderWidth: 1,
            borderColor: t.border,
          }}
        >
          <Ionicons name={icon} size={30} color={t.inkSoft} />
        </View>

        <Text
          style={{
            fontFamily: fonts.serif,
            fontSize: 24,
            lineHeight: 32,
            color: t.ink,
            textAlign: 'center',
            marginTop: spacing.lg,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontFamily: fonts.sans,
            fontSize: 15,
            lineHeight: 23,
            color: t.inkSoft,
            textAlign: 'center',
            marginTop: spacing.sm,
          }}
        >
          {body}
        </Text>

        <PillButton
          label={actionLabel}
          onPress={onAction}
          style={{ marginTop: spacing.xl, alignSelf: 'stretch' }}
        />

        {router.canGoBack() ? (
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={tr('a11y.back')}
            style={({ pressed }) => ({
              minHeight: TAP_MIN,
              justifyContent: 'center',
              paddingHorizontal: spacing.lg,
              borderRadius: radius.pill,
              marginTop: spacing.xs,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Text style={{ fontFamily: fonts.sansMedium, fontSize: 15, color: t.inkSoft }}>
              {tr('notFound.back')}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </Screen>
  );
}
