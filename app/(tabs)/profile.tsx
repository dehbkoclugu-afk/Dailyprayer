import React, { useRef, useState } from 'react';
import { Alert, Linking, Platform, Pressable, Text, View, findNodeHandle, type GestureResponderEvent } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { OptionSheet, type SheetOption } from '@/components/OptionSheet';
import { ArtSlot } from '@/components/ArtSlot';
import { useTheme, useThemeName } from '@/hooks/useTheme';
import { useArtwork } from '@/hooks/useArtwork';
import { type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { useUserStore } from '@/state/useUserStore';
import { useStreakStore } from '@/state/useStreakStore';
import { useEntitlementStore } from '@/state/useEntitlementStore';
import { toast } from '@/state/useToastStore';
import { APPLICATION_LOCALES, useT, translate } from '@/i18n';
import { getDirectionalIconName } from '@/i18n/direction';
import * as NotificationService from '@/services/notifications';
import { clearLocalUserData } from '@/services/localData';
import { getSupportUserId, openSubscriptionManagement } from '@/services/purchases';
import {
  displayReminderTime,
  parseReminderTime,
  toStoredReminderTime,
} from '@/lib/reminderTime';
import type { ThemeName } from '@/theme/tokens';
import { GLOBAL_LANGUAGE_CATALOG } from '@/i18n/globalLanguageCatalog';
import { countRecentActiveDays } from '@/lib/dailyExperience';

export default function Profile() {
  const t = useTheme();
  const themeName = useThemeName();
  const artwork = useArtwork();
  const { t: tr, locale } = useT();
  const {
    quiz, themePreference, setThemePreference, language,
    scriptureLocale, setQuiz, reset,
  } = useUserStore();
  const { count, bestCount, totalDays, activeDays } = useStreakStore();
  const isPlus = useEntitlementStore((s) => s.isPlus);
  const [sheet, setSheet] = useState<null | 'appearance'>(null);
  const sheetReturnFocus = useRef<number | null>(null);
  const [showIosReminderPicker, setShowIosReminderPicker] = useState(false);
  const [reminderDraft, setReminderDraft] = useState(() => parseReminderTime('07:30'));
  const recentDays = countRecentActiveDays(activeDays ?? []);
  const recentStart = new Date();
  recentStart.setHours(12, 0, 0, 0);
  recentStart.setDate(recentStart.getDate() - 6);
  const recentRange = `${new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(recentStart)}–${new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(new Date())}`;

  const appearanceOptions: SheetOption<ThemeName | 'system'>[] = [
    { value: 'system', label: tr('profile.auto') },
    { value: 'vigil', label: tr('profile.vigil') },
    { value: 'dawn', label: tr('profile.dawn') },
  ];
  const appearanceLabel =
    appearanceOptions.find((o) => o.value === themePreference)?.label ?? tr('profile.auto');
  const languageLabel =
    language === 'system'
      ? tr('profile.auto')
      : APPLICATION_LOCALES.find((locale) => locale.tag === language)?.nativeName ?? language;
  const scriptureLabel =
    scriptureLocale === 'system'
      ? tr('profile.auto')
      : GLOBAL_LANGUAGE_CATALOG.find((item) => item.tag === scriptureLocale)?.nativeName ?? String(scriptureLocale);

  const setReminder = async (time: string | null): Promise<boolean> => {
    if (!time) {
      setQuiz({ prayerTime: 'none' });
      await NotificationService.disableReminders();
      toast(translate('toast.reminderSet'));
      setShowIosReminderPicker(false);
      return true;
    }

    try {
      const granted = await NotificationService.requestPermission();
      if (!granted) {
        await NotificationService.disableReminders();
        setQuiz({ prayerTime: 'none' });
        Alert.alert(tr('profile.reminderTitle'), tr('profile.reminderMsg'));
        await Linking.openSettings().catch(() => {});
        return false;
      }
      await NotificationService.scheduleDailyReminder(time);
      await NotificationService.scheduleStreakSave(count);
      setQuiz({ prayerTime: time });
      toast(translate('toast.reminderSet'));
      setShowIosReminderPicker(false);
      return true;
    } catch {
      await NotificationService.disableReminders().catch(() => {});
      setQuiz({ prayerTime: 'none' });
      Alert.alert(tr('profile.reminderTitle'), tr('profile.reminderMsg'));
      return false;
    }
  };

  const openReminderPicker = () => {
    const fallback = new Date();
    fallback.setHours(7, 30, 0, 0);
    const value = parseReminderTime(
      quiz.prayerTime && quiz.prayerTime !== 'none' ? quiz.prayerTime : null,
      fallback,
    );

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value,
        mode: 'time',
        onChange: (event, date) => {
          if (event.type === 'set' && date) void setReminder(toStoredReminderTime(date));
        },
      });
      return;
    }

    if (Platform.OS === 'web') {
      Alert.alert(tr('profile.reminderTitle'), tr('profile.reminderMsg'), [
        { text: tr('profile.reminderMorning'), onPress: () => void setReminder('07:30') },
        { text: tr('profile.reminderMidday'), onPress: () => void setReminder('12:30') },
        { text: tr('profile.reminderEvening'), onPress: () => void setReminder('21:00') },
        { text: tr('profile.cancel'), style: 'cancel' },
      ]);
      return;
    }

    setReminderDraft(value);
    setShowIosReminderPicker(true);
  };

  const confirmLocalDataDeletion = () =>
    Alert.alert(tr('profile.deleteData'), tr('profile.deleteDataMessage'), [
      { text: tr('profile.cancel'), style: 'cancel', isPreferred: true },
      {
        text: tr('profile.deleteDataConfirm'),
        style: 'destructive',
        onPress: async () => {
          try {
            await clearLocalUserData();
            router.replace('/');
          } catch {
            Alert.alert(tr('profile.deleteData'), tr('profile.deleteDataError'));
          }
        },
      },
    ], { cancelable: true });

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

  const contactSupport = async () => {
    const address = 'dehbkoclugu@gmail.com';
    try {
      await Linking.openURL(`mailto:${address}`);
    } catch {
      await Clipboard.setStringAsync(address);
      Alert.alert(tr('paywall.supportErrorTitle'), `${tr('paywall.supportErrorBody')}\n\n${address}`);
    }
  };

  const copySupportId = async () => {
    const id = await getSupportUserId();
    if (!id) {
      Alert.alert(`${tr('profile.contact')} · ID`, tr('paywall.supportErrorBody'));
      return;
    }
    await Clipboard.setStringAsync(id);
    Alert.alert(`${tr('profile.contact')} · ID`, tr('verse.copied'));
  };

  return (
    <Screen tabbed>
      <Text style={[ty.title, { color: t.ink }]}>
        {quiz.name ? quiz.name : tr('profile.journey')}
      </Text>
      <Text style={[ty.secondary, { color: t.inkSoft, marginTop: spacing.xs }]}>
        {tr('profile.subtitle')}
      </Text>

      {/* streak , the current run is the hero (a flame + one number reads warm,
          not the hollow "three identical 1s" dashboard); best/total sit below
          as a quiet footnote so the card has hierarchy instead of three peers. */}
      <ArtSlot
        id="A15-building-candle"
        scrim="soft"
        radius={radius.card}
        style={{
          backgroundColor: t.surface,
          borderRadius: radius.card,
          borderWidth: 1,
          borderColor: t.border,
          marginTop: spacing.lg,
        }}
      >
        <View style={{ padding: spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: artwork.foreground.badge,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="flame" size={26} color={t.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  ...ty.metric,
                  color: artwork.foreground.primary,
                  fontVariant: ['tabular-nums'],
                }}
              >
                {count}
              </Text>
              <Text style={{ ...ty.captionRegular, color: artwork.foreground.secondary, marginTop: 2 }}>
                {tr('profile.dayStreak')}
              </Text>
            </View>
          </View>
          <View style={{ height: 1, backgroundColor: artwork.foreground.badge, marginVertical: spacing.md }} />
          <View
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={`${recentRange}: ${recentDays}/7`}
            accessibilityValue={{ min: 0, max: 7, now: recentDays }}
          >
            <View style={{ flexDirection: 'row', gap: spacing.xs }}>
              {Array.from({ length: 7 }, (_, index) => (
                <View
                  key={index}
                  style={{
                    flex: 1,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: index < recentDays ? t.gold : artwork.foreground.badge,
                  }}
                />
              ))}
            </View>
            <Text style={{ ...ty.captionRegular, color: artwork.foreground.secondary, marginTop: spacing.sm }}>
              {recentRange} · {recentDays}/7
            </Text>
          </View>
          <View style={{ height: 1, backgroundColor: artwork.foreground.badge, marginVertical: spacing.md }} />
          <Text style={{ ...ty.captionRegular, color: artwork.foreground.secondary }}>
            {tr('profile.bestStreak')} {bestCount} · {tr('profile.totalDays')} {totalDays}
          </Text>
        </View>
      </ArtSlot>

      {/* subscription card */}
      <ArtSlot
        id="A8-paywall-hero"
        scrim="soft"
        radius={radius.card}
        style={{
          // Active Plus previously filled with goldSoft , a muddy olive block on
          // the dark surface. The gold border + filled star already read as
          // premium, so keep a clean surface fill in both states.
          backgroundColor: t.surface,
          borderColor: t.gold,
          borderWidth: 1,
          borderRadius: radius.card,
          marginTop: spacing.xl,
        }}
      >
        <View style={{ padding: spacing.xl }}>
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
              <Text style={{ ...ty.bodyCompactStrong, color: artwork.foreground.primary }}>
                {isPlus ? tr('profile.plusActive') : tr('profile.plusCta')}
              </Text>
              <Text style={{ ...ty.captionRegular, color: artwork.foreground.secondary, marginTop: 2 }}>
                {isPlus ? tr('profile.plusThanks') : tr('profile.plusSub')}
              </Text>
            </View>
            {!isPlus ? <Ionicons name={getDirectionalIconName('chevron-forward', locale)} size={20} color={artwork.foreground.tertiary} /> : null}
          </Pressable>
          {isPlus ? (
            <>
              <View style={{ height: 1, backgroundColor: artwork.foreground.badge, marginTop: spacing.lg }} />
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
                    ...ty.secondaryMedium,
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
      </ArtSlot>

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
          onPress={(event) => {
            sheetReturnFocus.current = findNodeHandle(event.currentTarget as unknown as React.Component);
            setSheet('appearance');
          }}
          first
        />
        <ValueRow
          icon="language-outline"
          label={tr('profile.language')}
          value={languageLabel}
          onPress={() => router.push('/application-language')}
        />
        <ValueRow
          icon="book-outline"
          label={tr('profile.scriptureLanguage')}
          value={scriptureLabel}
          onPress={() => router.push('/scripture-language')}
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
            quiz.prayerTime && quiz.prayerTime !== 'none'
              ? displayReminderTime(quiz.prayerTime, locale)
              : tr('profile.off')
          }`}
          onPress={openReminderPicker}
        />
        {quiz.prayerTime && quiz.prayerTime !== 'none' ? (
          <Row
            icon="notifications-off-outline"
            label={tr('profile.reminderOff')}
            onPress={() => void setReminder(null)}
          />
        ) : null}
        {showIosReminderPicker ? (
          <View style={{ padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: t.border }}>
            <DateTimePicker
              value={reminderDraft}
              mode="time"
              display="spinner"
              onChange={(_, date) => {
                if (date) setReminderDraft(date);
              }}
              themeVariant={themeName === 'vigil' ? 'dark' : 'light'}
            />
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setShowIosReminderPicker(false)}
                style={({ pressed }) => ({ flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}
              >
                <Text style={{ ...ty.label, color: t.inkSoft }}>{tr('profile.cancel')}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => void setReminder(toStoredReminderTime(reminderDraft))}
                style={({ pressed }) => ({ flex: 1, minHeight: 48, borderRadius: radius.pill, backgroundColor: t.gold, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.75 : 1 })}
              >
                <Text style={{ ...ty.label, color: t.bg }}>{tr('paywall.continue')}</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
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
        <Row icon="mail-outline" label={tr('profile.contact')} onPress={contactSupport} />
        <Row icon="key-outline" label={`${tr('profile.contact')} · ID`} onPress={() => void copySupportId()} />
        <Pressable
          onPress={() => {
            reset();
            router.replace('/onboarding');
          }}
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
          <Text style={{ ...ty.secondary, color: t.danger }}>
            {tr('profile.restart')}
          </Text>
        </Pressable>
        <Pressable
          onPress={confirmLocalDataDeletion}
          accessibilityRole="button"
          accessibilityLabel={tr('profile.deleteData')}
          accessibilityHint={tr('profile.deleteDataMessage')}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            padding: spacing.lg,
            minHeight: 52,
            borderTopWidth: 1,
            borderTopColor: t.border,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Ionicons name="trash-outline" size={20} color={t.danger} />
          <Text style={{ ...ty.secondary, color: t.danger }}>
            {tr('profile.deleteData')}
          </Text>
        </Pressable>
      </View>

      <Text style={{ ...ty.labelSmallRegular, color: t.inkFaint, textAlign: 'center', marginTop: spacing.xl }}>
        Lumen v1.0.0
      </Text>

      <OptionSheet
        visible={sheet === 'appearance'}
        title={tr('profile.appearance')}
        options={appearanceOptions}
        selected={themePreference}
        onSelect={setThemePreference}
        onClose={() => setSheet(null)}
        returnFocusHandle={sheetReturnFocus.current}
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
  onPress: (event: GestureResponderEvent) => void;
  first?: boolean;
}) {
  const t = useTheme();
  const { locale } = useT();
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
        <Text style={{ ...ty.secondary, color: t.ink, flex: 1 }}>{label}</Text>
        <Text style={{ ...ty.secondaryMedium, color: t.gold }}>{value}</Text>
        <Ionicons name={getDirectionalIconName('chevron-forward', locale)} size={18} color={t.inkFaint} />
      </View>
    </Pressable>
  );
}

function Row({ icon, label, onPress }: { icon: string; label: string; onPress?: () => void }) {
  const t = useTheme();
  const { locale } = useT();
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
        <Text style={{ ...ty.secondary, color: t.ink, flex: 1 }}>{label}</Text>
        <Ionicons name={getDirectionalIconName('chevron-forward', locale)} size={18} color={t.inkFaint} />
      </View>
    </Pressable>
  );
}
