import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { useTheme } from '@/hooks/useTheme';
import { fonts, type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { useUserStore } from '@/state/useUserStore';
import { useStreakStore } from '@/state/useStreakStore';
import { useEntitlementStore } from '@/state/useEntitlementStore';
import type { ThemeName } from '@/theme/tokens';

export default function Profile() {
  const t = useTheme();
  const { quiz, themePreference, setThemePreference, reset } = useUserStore();
  const { count, bestCount, totalDays } = useStreakStore();
  const isPlus = useEntitlementStore((s) => s.isPlus);

  return (
    <Screen tabbed>
      <Text style={[ty.title, { color: t.ink }]}>
        {quiz.name ? quiz.name : 'Your journey'}
      </Text>

      {/* stats — one unified card, not floating tiles */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: t.surface,
          borderRadius: radius.card,
          borderWidth: 1,
          borderColor: t.border,
          marginTop: spacing.lg,
          paddingVertical: spacing.lg,
        }}
      >
        <Stat icon="flame" label="Day streak" value={`${count}`} />
        <View style={{ width: 1, backgroundColor: t.border, marginVertical: spacing.sm }} />
        <Stat icon="trophy-outline" label="Best streak" value={`${bestCount}`} />
        <View style={{ width: 1, backgroundColor: t.border, marginVertical: spacing.sm }} />
        <Stat icon="calendar-outline" label="Total days" value={`${totalDays}`} />
      </View>

      {/* subscription card */}
      <Pressable
        onPress={() => (!isPlus ? router.push('/paywall') : null)}
        accessibilityRole="button"
        accessibilityLabel={isPlus ? 'Lumen Plus active' : 'Upgrade to Lumen Plus'}
        style={{
          backgroundColor: isPlus ? t.goldSoft : t.surface,
          borderColor: t.gold,
          borderWidth: 1,
          borderRadius: radius.card,
          padding: spacing.xl,
          marginTop: spacing.xl,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.lg,
        }}
      >
        <Ionicons name={isPlus ? 'star' : 'star-outline'} size={26} color={t.gold} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 16, color: t.ink }}>
            {isPlus ? 'Lumen Plus — active' : 'Unlock Lumen Plus'}
          </Text>
          <Text style={{ fontFamily: fonts.sans, fontSize: 13, color: t.inkSoft, marginTop: 2 }}>
            {isPlus
              ? 'Thank you — your subscription also gifts Lumen to someone in need.'
              : 'Full prayer library, all plans, sleep content.'}
          </Text>
        </View>
        {!isPlus ? <Ionicons name="chevron-forward" size={20} color={t.inkFaint} /> : null}
      </Pressable>

      <SectionHeader title="Appearance" />
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {(
          [
            { v: 'system', label: 'Auto' },
            { v: 'vigil', label: 'Vigil (dark)' },
            { v: 'dawn', label: 'Dawn (light)' },
          ] as { v: ThemeName | 'system'; label: string }[]
        ).map(({ v, label }) => {
          const active = themePreference === v;
          return (
            <Pressable
              key={v}
              onPress={() => setThemePreference(v)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={{
                backgroundColor: active ? t.goldSoft : t.surface,
                borderColor: active ? t.gold : t.border,
                borderWidth: 1,
                borderRadius: radius.pill,
                paddingHorizontal: spacing.lg,
                minHeight: 44,
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontFamily: fonts.sansMedium, fontSize: 14, color: active ? t.gold : t.inkSoft }}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <SectionHeader title="About" />
      <View
        style={{
          backgroundColor: t.surface,
          borderRadius: radius.card,
          borderWidth: 1,
          borderColor: t.border,
        }}
      >
        <Row icon="notifications-outline" label={`Daily reminder · ${quiz.prayerTime && quiz.prayerTime !== 'none' ? quiz.prayerTime : 'off'}`} />
        <Row icon="document-text-outline" label="Terms & Privacy" />
        <Row icon="mail-outline" label="Contact us" />
        <Pressable
          onPress={reset}
          accessibilityRole="button"
          accessibilityLabel="Restart onboarding"
          style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, minHeight: 52 }}
        >
          <Ionicons name="refresh-outline" size={20} color={t.danger} />
          <Text style={{ fontFamily: fonts.sans, fontSize: 15, color: t.danger }}>
            Restart onboarding
          </Text>
        </Pressable>
      </View>

      <Text style={{ fontFamily: fonts.sans, fontSize: 12, color: t.inkFaint, textAlign: 'center', marginTop: spacing.xl }}>
        Lumen v1.0.0 · Made with prayer
      </Text>
    </Screen>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string }) {
  const t = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
      <Ionicons name={icon as never} size={20} color={t.gold} />
      <Text
        style={{
          fontFamily: fonts.sansBold,
          fontSize: 22,
          color: t.ink,
          fontVariant: ['tabular-nums'],
        }}
      >
        {value}
      </Text>
      <Text style={{ fontFamily: fonts.sans, fontSize: 12, color: t.inkSoft }}>{label}</Text>
    </View>
  );
}

function Row({ icon, label }: { icon: string; label: string }) {
  const t = useTheme();
  return (
    <View style={{ paddingHorizontal: spacing.lg }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          paddingVertical: spacing.lg,
          // inset divider: starts at text edge, not card edge
          borderBottomWidth: 1,
          borderBottomColor: t.border,
          minHeight: 52,
        }}
      >
        <Ionicons name={icon as never} size={20} color={t.inkSoft} />
        <Text style={{ fontFamily: fonts.sans, fontSize: 15, color: t.ink, flex: 1 }}>{label}</Text>
        <Ionicons name="chevron-forward" size={18} color={t.inkFaint} />
      </View>
    </View>
  );
}
