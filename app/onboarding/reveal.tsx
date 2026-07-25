import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { PillButton } from '@/components/PillButton';
import { ArtSlot } from '@/components/ArtSlot';
import { useTheme } from '@/hooks/useTheme';
import { fonts, type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { useUserStore } from '@/state/useUserStore';
import * as NotificationService from '@/services/notifications';
import { useT } from '@/i18n';

/** Personalized plan reveal — the moment before the paywall. */
export default function Reveal() {
  const t = useTheme();
  const reduceMotion = useReducedMotion();
  const quiz = useUserStore((s) => s.quiz);
  const setOnboarded = useUserStore((s) => s.setOnboarded);
  const { t: tr } = useT();
  const [enablingReminder, setEnablingReminder] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);

  const goal = quiz.goals[0]
    ? tr(`reveal.goal.${quiz.goals[0]}` as never)
    : tr('reveal.goal.default');

  const items = [
    { icon: 'sunny-outline', text: tr('reveal.itemVerse') },
    { icon: 'book-outline', text: tr('reveal.itemDevotional') },
    { icon: 'flame-outline', text: `${tr('reveal.itemPrayer')} ${goal}` },
    { icon: 'moon-outline', text: tr('reveal.itemSleep') },
  ] as const;

  const finish = () => {
    setOnboarded(true);
    router.replace('/(tabs)/today');
  };

  const enableReminder = async () => {
    if (!quiz.prayerTime || quiz.prayerTime === 'none') return;
    setEnablingReminder(true);
    try {
      const granted = await NotificationService.requestPermission();
      if (!granted) {
        Alert.alert(tr('reminder.deniedTitle'), tr('reminder.deniedBody'));
        return;
      }
      await NotificationService.scheduleDailyReminder(quiz.prayerTime);
      await NotificationService.scheduleStreakSave();
      setReminderEnabled(true);
    } catch {
      Alert.alert(tr('reminder.errorTitle'), tr('reminder.errorBody'));
    } finally {
      setEnablingReminder(false);
    }
  };

  return (
    <Screen scroll={false} style={{ justifyContent: 'space-between' }}>
      <View>
        <Animated.View entering={reduceMotion ? undefined : FadeInDown.springify().damping(20)}>
          <ArtSlot
            id="A7-plan-crest"
            height={120}
            fit="contain"
            style={{ width: 120, marginTop: spacing.xl }}
          />
          <Text style={[ty.display, { color: t.ink, marginTop: spacing.lg }]}>
            {quiz.name ? `${quiz.name}, ` : ''}{tr('reveal.title')}
          </Text>
          <Text style={[ty.body, { color: t.inkSoft, marginTop: spacing.md }]}>
            {tr('reveal.body')}
          </Text>
        </Animated.View>
        <View style={{ gap: spacing.md, marginTop: spacing.xxl }}>
          {items.map((item, i) => (
            <Animated.View
              key={item.text}
              entering={
                reduceMotion
                  ? undefined
                  : FadeInDown.delay(200 + i * 150).springify().damping(20)
              }
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                backgroundColor: t.surface,
                borderRadius: radius.inner,
                borderWidth: 1,
                borderColor: t.border,
                padding: spacing.lg,
              }}
            >
              <Ionicons name={item.icon} size={22} color={t.gold} />
              <Text style={{ fontFamily: fonts.sansMedium, fontSize: 15, color: t.ink, flex: 1 }}>
                {item.text}
              </Text>
            </Animated.View>
          ))}
        </View>
      </View>
      <View style={{ gap: spacing.md }}>
        {quiz.prayerTime && quiz.prayerTime !== 'none' && !reminderEnabled ? (
          <PillButton
            label={enablingReminder ? tr('reminder.enabling') : tr('reminder.enable')}
            onPress={enableReminder}
            disabled={enablingReminder}
            variant="secondary"
          />
        ) : null}
        {reminderEnabled ? (
          <Text style={[ty.secondary, { color: t.inkSoft, textAlign: 'center' }]}>
            {tr('reminder.enabled')}
          </Text>
        ) : null}
        <PillButton label={tr('reveal.start')} onPress={finish} />
      </View>
    </Screen>
  );
}
