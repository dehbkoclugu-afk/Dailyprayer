import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { OptionSheet, type SheetOption } from '@/components/OptionSheet';
import { useTheme } from '@/hooks/useTheme';
import { fonts, type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { useUserStore } from '@/state/useUserStore';
import { useStreakStore } from '@/state/useStreakStore';
import { useEntitlementStore } from '@/state/useEntitlementStore';
import { toast } from '@/state/useToastStore';
import { useT, translate, SUPPORTED_LOCALES } from '@/i18n';
import * as NotificationService from '@/services/notifications';
import { openSubscriptionManagement } from '@/services/purchases';
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
  const [sheet, setSheet] = useState<null | 'appearance' | 'language'>(null);

  const appearanceOptions: SheetOption<ThemeName | 'system'>[] = [
    { value: 'system', label: tr('profile.auto') },
    { value: 'vigil', label: tr('profile.vigil') },
    { value: 'dawn', label: tr('profile.dawn') },
  ];
  const languageOptions: SheetOption<Locale | 'system'>[] = [
    { value: 'system', label: tr('profile.auto') },
    ...SUPPORTED_LOCALES.map((l) => ({ value: l, label: LOCALE_LABELS[l] })),
  ];
  const appearanceLabel =
    appearanceOptions.find((o) => o.value === themePreference)?.label ?? tr('profile.auto');
  const languageLabel =
    language === 'system' ? tr('profile.auto') : LOCALE_LABELS[language as Locale];

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

  const manageSubscription = async () => {
    try {
      await openSubscriptionManagement();
    } catch {
      Alert.alert(
        tr('profile.manageSubscriptionErrorTitle'),
        tr('profile.manageSubscriptionErrorBody'),
      );
    }
  };

  return (
    <Screen tabbed>
      <Text style={[ty.title, { color: t.ink }]}>
        {quiz.name ? quiz.name : tr('profile.journey')}
      </Text>
      <Text style={[ty.secondary, { color: t.inkSoft, marginTop: spacing.xs }]}>
        {tr('profile.subtitle')}
      </Text>

      {/* streak — the current run is the hero (a flame + one number reads warm,
          not the hollow "three identical 1s" dashboard); best/total sit below
          as a quiet footnote so the card has hierarchy instead of three peers. */}
      <View
        style={{
          backgroundColor: t.surface,
          borderRadius: radius.card,
          borderWidth: 1,
          borderColor: t.border,
          marginTop: spacing.lg,
          padding: spacing.lg,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: t.goldSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="flame" size={26} color={t.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: fonts.sansBold,
                fontSize: 30,
                color: t.ink,
                fontVariant: ['tabular-nums'],
              }}
            >
              {count}
            </Text>
            <Text style={{ fontFamily: fonts.sans, fontSize: 13, color: t.inkSoft, marginTop: 2 }}>
              {tr('profile.dayStreak')}
            </Text>
          </View>
        </View>
        <View style={{ height: 1, backgroundColor: t.border, marginVertical: spacing.md }} />
        <Text style={{ fontFamily: fonts.sans, fontSize: 13, color: t.inkSoft }}>
          {tr('profile.bestStreak')} {bestCount} · {tr('profile.totalDays')} {totalDays}
        </Text>
      </View>

      {/* subscription card */}
      <View
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
        }}
      >
        <Pressable
          onPress={() => router.push('/paywall?from=profile')}
          disabled={isPlus}
          accessibilityRole={isPlus ? undefined : 'button'}
          accessibilityLabel={isPlus ? undefined : tr('profile.plusCta')}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.lg,
            opacity: pressed ? 0.7 : 1,
          })}
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
        {isPlus ? (
          <>
            <View style={{ height: 1, backgroundColor: t.border, marginTop: spacing.lg }} />
            <Pressable
              onPress={manageSubscription}
              accessibilityRole="button"
              accessibilityLabel={tr('profile.manageSubscription')}
              style={({ pressed }) => ({
                minHeight: 48,
                paddingTop: spacing.md,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Text
                style={{
                  flex: 1,
                  fontFamily: fonts.sansMedium,
                  fontSize: 15,
                  color: t.blue,
                }}
              >
                {tr('profile.manageSubscription')}
              </Text>
              <Ionicons name="open-outline" size={18} color={t.blue} />
            </Pressable>
          </>
        ) : null}
      </View>

      <SectionHeader title={tr('profile.preferences')} />
      <View
        style={{
          backgroundColor: t.surface,
          borderRadius: radius.card,
          borderWidth: 1,
          borderColor: t.border,
        }}
      >
        <ValueRow
          icon="contrast-outline"
          label={tr('profile.appearance')}
          value={appearanceLabel}
          onPress={() => setSheet('appearance')}
          first
        />
        <ValueRow
          icon="language-outline"
          label={tr('profile.language')}
          value={languageLabel}
          onPress={() => setSheet('language')}
        />
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

      <OptionSheet
        visible={sheet === 'appearance'}
        title={tr('profile.appearance')}
        options={appearanceOptions}
        selected={themePreference}
        onSelect={setThemePreference}
        onClose={() => setSheet(null)}
      />
      <OptionSheet
        visible={sheet === 'language'}
        title={tr('profile.language')}
        options={languageOptions}
        selected={language}
        onSelect={setLanguage}
        onClose={() => setSheet(null)}
      />
    </Screen>
  );
}

function ValueRow({
  icon,
  label,
  value,
  onPress,
  first,
}: {
  icon: string;
  label: string;
  value: string;
  onPress: () => void;
  first?: boolean;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      style={({ pressed }) => ({ paddingHorizontal: spacing.lg, opacity: pressed ? 0.6 : 1 })}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          paddingVertical: spacing.lg,
          minHeight: 56,
          borderTopWidth: first ? 0 : 1,
          borderTopColor: t.border,
        }}
      >
        <Ionicons name={icon as never} size={20} color={t.inkSoft} />
        <Text style={{ fontFamily: fonts.sans, fontSize: 15, color: t.ink, flex: 1 }}>{label}</Text>
        <Text style={{ fontFamily: fonts.sansMedium, fontSize: 15, color: t.gold }}>{value}</Text>
        <Ionicons name="chevron-forward" size={18} color={t.inkFaint} />
      </View>
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
