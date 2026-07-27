import React, { useCallback, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { OptionSheet, type SheetOption } from '@/components/OptionSheet';
import { DataActionSheet, type DataAction } from '@/components/DataActionSheet';
import { ReminderTimeSheet } from '@/components/ReminderTimeSheet';
import { formatTime } from '@/lib/time';
import { useTheme } from '@/hooks/useTheme';
import { fonts, type as ty } from '@/theme/typography';
import { radius, spacing, TAP_MIN } from '@/theme/tokens';
import { useUserStore } from '@/state/useUserStore';
import { useStreakStore } from '@/state/useStreakStore';
import { useEntitlementStore } from '@/state/useEntitlementStore';
import { toast } from '@/state/useToastStore';
import { useT, translate, SUPPORTED_LOCALES } from '@/i18n';
import * as NotificationService from '@/services/notifications';
import { openSubscriptionManagement } from '@/services/purchases';
import { SUPPORT_EMAIL, contactSupport } from '@/services/support';
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
  const { quiz, themePreference, setThemePreference, language, setLanguage, setQuiz } =
    useUserStore();
  const { count, bestCount, totalDays } = useStreakStore();
  const isPlus = useEntitlementStore((s) => s.isPlus);
  const [sheet, setSheet] = useState<null | 'appearance' | 'language'>(null);
  // Destructive data actions are confirmed in two stages — see DataActionSheet.
  const [dataAction, setDataAction] = useState<DataAction | null>(null);
  const [permission, setPermission] = useState<NotificationService.PermissionState>('undetermined');

  // Re-read on focus: someone can leave for the system settings, allow
  // notifications and come back, and the row must stop saying "blocked".
  useFocusEffect(
    useCallback(() => {
      let active = true;
      NotificationService.getPermissionState()
        .then((state) => {
          if (active) setPermission(state);
        })
        .catch(() => {});
      return () => {
        active = false;
      };
    }, []),
  );

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

  /**
   * Only claim a reminder was set if one actually was.
   *
   * The old flow wrote the time, fired the permission request and then showed
   * "Reminder updated" regardless — so a user who had blocked notifications was
   * told a reminder existed while nothing was scheduled (roadmap item 16).
   */
  const setReminder = async (time: string | null) => {
    if (!time) {
      setQuiz({ prayerTime: 'none' });
      // Turning it off has to cancel the schedule, or notifications keep arriving
      // while the row says "Off".
      await NotificationService.cancelReminders().catch(() => {});
      toast(translate('toast.reminderOff'));
      return;
    }

    const state = await NotificationService.requestPermissionState().catch(
      () => 'blocked' as const,
    );
    setPermission(state);

    if (state !== 'granted') {
      // No dead success message, and a way out: the OS will not prompt again, so
      // the only route back is the system settings page.
      setQuiz({ prayerTime: 'none' });
      Alert.alert(tr('profile.reminderBlockedTitle'), tr('profile.reminderBlockedBody'), [
        { text: tr('data.cancel'), style: 'cancel' },
        {
          text: tr('profile.reminderOpenSettings'),
          onPress: () => {
            NotificationService.openSystemSettings().catch(() => {});
          },
        },
      ]);
      return;
    }

    setQuiz({ prayerTime: time });
    await NotificationService.scheduleDailyReminder(time).catch(() => {});
    await NotificationService.scheduleStreakSave(count).catch(() => {});
    toast(translate('toast.reminderSet'));
  };

  // A real time picker, not three fixed times in an Alert (roadmap item 17).
  const [timeSheet, setTimeSheet] = useState(false);
  const openReminderPicker = () => setTimeSheet(true);

  const openContact = async () => {
    const outcome = await contactSupport(tr('profile.contactSubject'));
    if (outcome === 'copied') toast(tr('toast.contactCopied'));
    else if (outcome === 'failed') {
      Alert.alert(
        tr('profile.contactFailedTitle'),
        tr('profile.contactFailedBody').replace('{email}', SUPPORT_EMAIL),
      );
    }
  };

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

  const reminderTime = quiz.prayerTime && quiz.prayerTime !== 'none' ? quiz.prayerTime : null;
  // Blocked only matters once a time has been chosen; with no reminder wanted,
  // permission is irrelevant and the row should just read "Off".
  const reminderBlocked = permission === 'blocked' && Boolean(reminderTime);
  const reminderLabel = reminderBlocked
    ? tr('profile.reminderBlocked')
    : (formatTime(reminderTime) ?? tr('profile.off'));

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
                minHeight: TAP_MIN,
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
        {/* The row reports the real state, not what was stored: a saved time means
            nothing while the OS is blocking notifications (roadmap item 16). */}
        <Row
          icon={reminderBlocked ? 'notifications-off-outline' : 'notifications-outline'}
          label={`${tr('profile.reminder')} · ${reminderLabel}`}
          onPress={
            reminderBlocked
              ? () => {
                  NotificationService.openSystemSettings().catch(() => {});
                }
              : openReminderPicker
          }
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
        {/* Was a dead row with no onPress. It now opens mail, and when the device
            has no mail client it copies the address instead of doing nothing
            (roadmap item 18). The address is shown either way. */}
        <Row
          icon="mail-outline"
          label={tr('profile.contact')}
          value={SUPPORT_EMAIL}
          onPress={openContact}
        />
        {/* Both destructive actions open a two-stage confirmation that itemizes what
            goes and what stays. Restart used to fire on a single tap. */}
        <Pressable
          onPress={() => setDataAction('restart')}
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
          <Ionicons name="refresh-outline" size={20} color={t.inkSoft} />
          <Text style={{ fontFamily: fonts.sans, fontSize: 15, color: t.ink }}>
            {tr('profile.restart')}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setDataAction('delete')}
          accessibilityRole="button"
          accessibilityLabel={tr('data.deleteAll')}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            padding: spacing.lg,
            minHeight: 52,
            // Clear space from "restart": one resets a name, the other erases a
            // journal, and they must not be a near-miss apart (roadmap item 22).
            marginTop: spacing.sm,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Ionicons name="trash-outline" size={20} color={t.danger} />
          <Text style={{ fontFamily: fonts.sans, fontSize: 15, color: t.danger }}>
            {tr('data.deleteAll')}
          </Text>
        </Pressable>
      </View>

      <Text style={{ fontFamily: fonts.sans, fontSize: 12, color: t.inkFaint, textAlign: 'center', marginTop: spacing.xl }}>
        Lumen v1.0.0
      </Text>

      <ReminderTimeSheet
        visible={timeSheet}
        current={reminderTime}
        onPick={(time) => {
          setTimeSheet(false);
          setReminder(time);
        }}
        onTurnOff={() => {
          setTimeSheet(false);
          setReminder(null);
        }}
        onClose={() => setTimeSheet(false)}
      />

      <DataActionSheet
        action={dataAction}
        onClose={() => setDataAction(null)}
        onDone={(action) => {
          setDataAction(null);
          toast(tr(action === 'delete' ? 'data.doneDelete' : 'data.doneRestart'));
        }}
      />

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

function Row({
  icon,
  label,
  value,
  onPress,
}: {
  icon: string;
  label: string;
  /** Shown on the right — used so the contact row displays the address itself. */
  value?: string;
  onPress?: () => void;
}) {
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
        {value ? (
          <Text
            numberOfLines={1}
            style={{ fontFamily: fonts.sansMedium, fontSize: 13, color: t.inkFaint, maxWidth: 170 }}
          >
            {value}
          </Text>
        ) : null}
        <Ionicons name="chevron-forward" size={18} color={t.inkFaint} />
      </View>
    </Pressable>
  );
}
