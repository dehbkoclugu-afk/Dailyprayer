import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Screen } from '@/components/Screen';
import { PillButton } from '@/components/PillButton';
import { ArtSlot } from '@/components/ArtSlot';
import { OnboardingBackdrop } from '@/components/OnboardingBackdrop';
import { useTheme } from '@/hooks/useTheme';
import { type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { useUserStore } from '@/state/useUserStore';
import * as NotificationService from '@/services/notifications';
import { useT } from '@/i18n';
import { getQuizSteps } from '@/data/quiz';

/** Personalized plan reveal , the moment before the paywall. */
export default function Reveal() {
  const t = useTheme();
  const { t: tr, locale } = useT();
  const quiz = useUserStore((s) => s.quiz);
  const setOnboarded = useUserStore((s) => s.setOnboarded);
  const setQuiz = useUserStore((s) => s.setQuiz);

  useEffect(() => {
    // Schedule the reminder they chose (permission prompt happens here, post-investment).
    if (quiz.prayerTime && quiz.prayerTime !== 'none') {
      NotificationService.requestPermission()
        .then(async (granted) => {
          if (!granted) {
            await NotificationService.disableReminders();
            setQuiz({ prayerTime: 'none' });
            return;
          }
          await NotificationService.scheduleDailyReminder(quiz.prayerTime as string);
          await NotificationService.scheduleStreakSave();
        })
        .catch(async () => {
          await NotificationService.disableReminders().catch(() => {});
          setQuiz({ prayerTime: 'none' });
        }); // web / denied permissions must never crash the reveal
    }
  }, [quiz.prayerTime, setQuiz]);

  const localizedGoalOptions = getQuizSteps(locale).find((step) => step.key === 'goals')?.options ?? [];
  const goal = localizedGoalOptions.find((option) => option.value === quiz.goals[0])?.label
    ?? '';

  const items = [
    { icon: 'sunny-outline', text: tr('reveal.itemVerse') },
    { icon: 'book-outline', text: tr('reveal.itemDevotional') },
    { icon: 'flame-outline', text: [tr('reveal.itemPrayers'), goal].filter(Boolean).join(' ') },
    { icon: 'moon-outline', text: tr('reveal.itemSleep') },
  ] as const;

  const finish = () => {
    setOnboarded(true);
    router.replace('/paywall?from=onboarding');
  };

  return (
    <Screen style={{ flexGrow: 1, justifyContent: 'space-between' }}>
      <OnboardingBackdrop />
      <View>
        <View>
          <ArtSlot
            id="A7-plan-crest"
            height={120}
            fit="contain"
            style={{ width: 120, alignSelf: 'center', marginTop: spacing.xl }}
          />
          <Text style={[ty.display, { color: t.ink, marginTop: spacing.lg }]}>
            {quiz.name ? `${quiz.name}, ${tr('reveal.planReadySuffix')}` : tr('reveal.planReady')}
          </Text>
          <Text style={[ty.body, { color: t.inkSoft, marginTop: spacing.md }]}>
            {tr('reveal.sub')}
          </Text>
        </View>
        <View style={{ gap: spacing.md, marginTop: spacing.xxl }}>
          {items.map((item) => (
            <View
              key={item.text}
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
              <Text style={{ ...ty.secondaryMedium, color: t.ink, flex: 1 }}>
                {item.text}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <PillButton label={tr('reveal.start')} onPress={finish} />
    </Screen>
  );
}
