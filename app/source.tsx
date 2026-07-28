import React from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { SUPPORTED_LOCALES, useT } from '@/i18n';
import { type } from '@/theme/typography';
import { radius, spacing, TAP_MIN } from '@/theme/tokens';
import { SCRIPTURE_SOURCES, type ScriptureSource } from '@/data/scriptureRights';
import type { Locale } from '@/i18n/translations';

/**
 * Text source — the full attribution the reader's one-line credit cannot carry
 * (roadmap item 12).
 *
 * Two of the six editions are licensed rather than public domain, and their
 * licenses require the copyright, source and version information to be available
 * to the reader. Everything shown here comes from `src/data/scriptureRights.ts`,
 * so the screen cannot drift from the rights the release gate checks.
 */

const LOCALE_LABEL: Record<Locale, string> = {
  tr: 'Türkçe',
  en: 'English',
  es: 'Español',
  pt: 'Português',
  fr: 'Français',
  de: 'Deutsch',
};

export default function SourceScreen() {
  const t = useTheme();
  const { t: tr, locale } = useT();

  const open = (url: string) => Linking.openURL(url).catch(() => {});

  const row = (label: string, value: string) => (
    <View style={{ marginTop: spacing.md }}>
      <Text
        style={{ ...type.labelSemi, letterSpacing: 0.6,
          color: t.inkFaint }}
      >
        {label}
      </Text>
      <Text
        style={{ ...type.callout, lineHeight: 23,
          color: t.ink,
          marginTop: 2 }}
      >
        {value}
      </Text>
    </View>
  );

  const link = (label: string, url: string) => (
    <Pressable
      onPress={() => open(url)}
      accessibilityRole="link"
      accessibilityLabel={`${label} — ${url}`}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        minHeight: TAP_MIN,
        // Two stacked links with no space between them are one mis-tap apart.
        marginTop: spacing.sm,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Ionicons name="open-outline" size={18} color={t.gold} />
      <Text style={{ ...type.calloutMedium, color: t.gold, flex: 1 }}>
        {label}
      </Text>
    </Pressable>
  );

  const card = (entry: Locale, source: ScriptureSource, current: boolean) => (
    <View
      key={entry}
      style={{
        marginTop: spacing.md,
        padding: spacing.lg,
        borderRadius: radius.card,
        backgroundColor: current ? t.surfaceAlt : 'transparent',
        borderWidth: 1,
        borderColor: current ? t.gold : t.border,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm }}>
        <Text style={{ ...type.labelSemi, color: current ? t.gold : t.inkSoft }}>
          {LOCALE_LABEL[entry]}
        </Text>
        <Text style={{ ...type.labelMedium, color: t.inkFaint }}>
          {source.status === 'public-domain' ? tr('source.publicDomain') : tr('source.licensed')}
        </Text>
      </View>

      <Text
        style={{ ...type.heading, lineHeight: 28,
          color: t.ink,
          marginTop: spacing.xs }}
      >
        {source.edition}
      </Text>

      {source.copyright ? row(tr('source.copyright'), source.copyright) : null}
      {source.license ? row(tr('source.license'), source.license) : null}
      {source.version ? row(tr('source.version'), source.version) : null}
      {/* The conditions are shown in the reader's language; the registry keeps the
          canonical English wording that the docs and release gate reason about. */}
      {source.conditionsKey ? row(tr('source.conditions'), tr(source.conditionsKey)) : null}
      {row(tr('source.reviewed'), source.reviewed)}

      <View style={{ marginTop: spacing.sm }}>
        {source.licenseUrl ? link(tr('source.openLicense'), source.licenseUrl) : null}
        {link(tr('source.openSource'), source.sourceUrl)}
      </View>
    </View>
  );

  const others = SUPPORTED_LOCALES.filter((l) => l !== locale);

  return (
    <Screen>
      <Pressable
        onPress={() => router.back()}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={tr('a11y.back')}
        style={({ pressed }) => ({
          width: TAP_MIN,
          height: TAP_MIN,
          justifyContent: 'center',
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <Ionicons name="chevron-back" size={26} color={t.inkSoft} />
      </Pressable>

      <Text style={{ ...type.title, color: t.ink }}>
        {tr('source.title')}
      </Text>
      <Text
        style={{ ...type.callout, lineHeight: 24,
          color: t.inkSoft,
          marginTop: spacing.sm }}
      >
        {tr('source.intro')}
      </Text>

      <Text
        style={{ ...type.labelSemi, letterSpacing: 1.4,
          color: t.inkFaint,
          marginTop: spacing.xl }}
      >
        {tr('source.current')}
      </Text>
      {card(locale, SCRIPTURE_SOURCES[locale], true)}

      <Text
        style={{ ...type.labelSemi, letterSpacing: 1.4,
          color: t.inkFaint,
          marginTop: spacing.xl }}
      >
        {tr('source.otherEditions')}
      </Text>
      {others.map((l) => card(l, SCRIPTURE_SOURCES[l], false))}
    </Screen>
  );
}
