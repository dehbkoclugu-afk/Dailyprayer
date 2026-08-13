import React from 'react';
import { Alert, Linking, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useT } from '@/i18n';
import { getDirectionalIconName } from '@/i18n/direction';
import { useScriptureLocale } from '@/i18n/scripture';
import { getBibleSource } from '@/data/bibleFull';
import { isHttpsScriptureUrl } from '@/data/scriptureSource';
import { type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

export default function ScriptureSourceScreen() {
  const t = useTheme();
  const { t: tr, locale } = useT();
  const source = getBibleSource(useScriptureLocale());

  const open = async (url: string | undefined) => {
    if (!isHttpsScriptureUrl(url)) {
      Alert.alert(tr('scriptureSource.title'), tr('scriptureSource.linkError'));
      return;
    }
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(tr('scriptureSource.title'), tr('scriptureSource.linkError'));
    }
  };

  const row = (label: string, value: string) => (
    <View style={{ gap: spacing.xs }}>
      <Text style={{ ...ty.labelSmall, color: t.gold }}>
        {label}
      </Text>
      <Text selectable style={{ ...ty.bodyCompactComfortable, color: t.ink }}>
        {value}
      </Text>
    </View>
  );

  const link = (label: string, url: string | undefined) => (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      onPress={() => void open(url)}
      style={({ pressed }) => ({
        minHeight: 48,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: t.border,
        backgroundColor: t.surfaceAlt,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Ionicons name="open-outline" size={18} color={t.gold} />
      <Text style={{ ...ty.secondaryStrong, color: t.ink }}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <Screen>
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel={tr('a11y.back')}
        style={({ pressed }) => ({
          width: 48,
          height: 48,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <Ionicons name={getDirectionalIconName('chevron-back', locale)} size={26} color={t.inkSoft} />
      </Pressable>

      <Text style={[ty.title, { color: t.ink, marginTop: spacing.md }]}>
        {tr('scriptureSource.title')}
      </Text>

      <View
        style={{
          gap: spacing.xl,
          marginTop: spacing.xl,
          padding: spacing.xl,
          borderRadius: radius.card,
          borderWidth: 1,
          borderColor: t.border,
          backgroundColor: t.surface,
        }}
      >
        {row(tr('scriptureSource.edition'), source.edition)}
        {row(
          tr('scriptureSource.rights'),
          source.rights ?? tr('scriptureSource.rightsUnavailable'),
        )}
        {row(tr('scriptureSource.attribution'), source.credit)}
      </View>

      <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
        {link(tr('scriptureSource.openSource'), source.sourceUrl)}
        {source.licenseUrl ? link(tr('scriptureSource.openLicense'), source.licenseUrl) : null}
      </View>
    </Screen>
  );
}
