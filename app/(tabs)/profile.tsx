import React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
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
import { toast } from '@/state/useToastStore';
import { useT, translate, SUPPORTED_LOCALES } from '@/i18n';
import * as NotificationService from '@/services/notifications';
import type { ThemeName } from '@/theme/tokens';
import type { Locale } from '@/i18n/translations';

const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  tr: 'Türkçe',
  es: 'Español',
  pt: 'Português',
  fr: 'Français',
  de: 'Deutsch',
};

export default function Profile() {
  const t = useTheme();
  const { t: tr } = useT();
  const { quiz, themePreference, setThemePreference, language, setLanguage, setQuiz, reset } =
    useUserStore();
  const { count, bestCount, totalDays } = useStreakStore();
  const isPlus = useEntitlementStore((s) => s.isPlus);

  const setReminder = (time: string | null) => {
    setQuiz({ prayerTime: time ?? 'none' });
    if (time) {
      NotificationService.requestPermission()
        .then((granted) => {
          if (granted) {
            NotificationService.scheduleDailyReminder(time);
            NotificationService.scheduleStreakSave(count);
          }
        })
        .catch(() => {});
    }
    toast(translate('toast.reminderSet'));
  };

  const openReminderPicker = () =>
    Alert.alert(tr('profile.reminderTitle'), tr('profile.reminderMsg'), [
      { text: tr('profile.reminderMorning'), onPress: () => setReminder('07:30') },
      { text: tr('profile.reminderMidday'), onPress: () => setReminder('12:30') },
      { text: tr('profile.reminderEvening'), onPress: () => setReminder('21:00') },
      { text: tr('profile.reminderOff'), style: 'destructive', onPress: () => setReminder(null) },
    ]);

  return (
    <Screen tabbed>
      <Text style={[ty.title, { color: t.ink }]}>
        {quiz.name ? quiz.name : tr('profile.journey')}
      </Text>

      {/* stats — one unified card */}
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
        <Stat icon="flame" label={tr('profile.dayStreak')} value={`${count}`} />
        <View style={{ width: 1, backgroundColor: t.border, marginVertical: spacing.sm }} />
        <Stat icon="trophy-outline" label={tr('profile.bestStreak')} value={`${bestCount}`} />
        <View style={{ width: 1, backgroundColor: t.border, marginVertical: spacing.sm }} />
        <Stat icon="calendar-outline" label={tr('profile.totalDays')} value={`${totalDays}`} />
      </View>

      {/* subscription card */}
      <Pressable
        onPress={() => (!isPlus ? router.push('/paywall?from=profile') : null)}
        accessibilityRole="button"
        accessibilityLabel={isPlus ? tr('profile.plusActive') : tr('profile.plusCta')}
        style={{
          // Active Plus previously filled with goldSoft — a muddy olive block on
          // the dark surface. The gold border + filled star already read as
          // premium, so keep a clean surface fill in both states.
          backgroundColor: t.surface,
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
            {isPlus ? tr('profile.plusActive') : tr('profile.plusCta')}
          </Text>
          <Text style={{ fontFamily: fonts.sans, fontSize: 13, color: t.inkSoft, marginTop: 2 }}>
            {isPlus ? tr('profile.plusThanks') : tr('profile.plusSub')}
          </Text>
        </View>
        {!isPlus ? <Ionicons name="chevron-forward" size={20} color={t.inkFaint} /> : null}
      </Pressable>

      <SectionHeader title={tr('profile.appearance')} />
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {(
          [
            { v: 'system', label: tr('profile.auto') },
            { v: 'vigil', label: tr('profile.vigil') },
            { v: 'dawn', label: tr('profile.dawn') },
          ] as { v: ThemeName | 'system'; label: string }[]
        ).map(({ v, label }) => (
          <Choice key={v} label={label} active={themePreference === v} onPress={() => setThemePreference(v)} />
        ))}
      </View>

      <SectionHeader title={tr('profile.language')} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        <Choice
          label={tr('profile.auto')}
          active={language === 'system'}
          onPress={() => setLanguage('system')}
        />
        {SUPPORTED_LOCALES.map((l) => (
          <Choice
            key={l}
            label={LOCALE_LABELS[l]}
            active={language === l}
            onPress={() => setLanguage(l)}
          />
        ))}
      </View>

      <SectionHeader title={tr('profile.about')} />
      <View
        style={{
          backgroundColor: t.surface,
          borderRadius: radius.card,
          borderWidth: 1,
          borderColor: t.border,
        }}
      >
        <Row
          icon="notifications-outline"
          label={`${tr('profile.reminder')} · ${
            quiz.prayerTime && quiz.prayerTime !== 'none' ? quiz.prayerTime : tr('profile.off')
          }`}
          onPress={openReminderPicker}
        />
        <Row
          icon="lock-closed-outline"
          label={tr('profile.privacy')}
          onPress={() => router.push({ pathname: '/legal', params: { doc: 'privacy' } })}
        />
        <Row
          icon="document-text-outline"
          label={tr('profile.terms')}
          onPress={() => router.push({ pathname: '/legal', params: { doc: 'terms' } })}
        />
        <Row icon="mail-outline" label={tr('profile.contact')} />
        <Pressable
          onPress={reset}
          accessibilityRole="button"
          accessibilityLabel={tr('profile.restart')}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            padding: spacing.lg,
            minHeight: 52,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Ionicons name="refresh-outline" size={20} color={t.danger} />
          <Text style={{ fontFamily: fonts.sans, fontSize: 15, color: t.danger }}>
            {tr('profile.restart')}
          </Text>
        </Pressable>
      </View>

      <Text style={{ fontFamily: fonts.sans, fontSize: 12, color: t.inkFaint, textAlign: 'center', marginTop: spacing.xl }}>
        Lumen v1.0.0
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

function Choice({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={{
        // Unselected chips take a surface fill (not transparent) so they read as
        // a cohesive group on the dark bg instead of near-invisible outlines —
        // that also makes the language chips' wrap look deliberate, not ragged.
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
}

function Row({ icon, label, onPress }: { icon: string; label: string; onPress?: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={label}
      style={({ pressed }) => ({ paddingHorizontal: spacing.lg, opacity: pressed ? 0.7 : 1 })}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          paddingVertical: spacing.lg,
          borderBottomWidth: 1,
          borderBottomColor: t.border,
          minHeight: 52,
        }}
      >
        <Ionicons name={icon as never} size={20} color={t.inkSoft} />
        <Text style={{ fontFamily: fonts.sans, fontSize: 15, color: t.ink, flex: 1 }}>{label}</Text>
        <Ionicons name="chevron-forward" size={18} color={t.inkFaint} />
      </View>
    </Pressable>
  );
}
