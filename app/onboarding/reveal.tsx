import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
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
import type { Locale } from '@/i18n/translations';

// Goal phrases read into the "Guided prayers: …" line. `en` is the fallback.
const GOAL_LABELS: Partial<Record<Locale, Record<string, string>>> = {
  en: {
    habit: 'a steady daily habit',
    closer: 'closeness with God',
    peace: 'peace over anxiety',
    sleep: 'restful sleep',
    bible: 'understanding scripture',
    gratitude: 'a grateful heart',
    default: 'a deeper prayer life',
  },
  tr: {
    habit: 'istikrarlı bir günlük alışkanlık',
    closer: 'Tanrı’yla yakınlık',
    peace: 'kaygı yerine huzur',
    sleep: 'huzurlu uyku',
    bible: 'kutsal metni anlamak',
    gratitude: 'şükreden bir kalp',
    default: 'daha derin bir dua hayatı',
  },
};

/** Personalized plan reveal — the moment before the paywall. */
export default function Reveal() {
  const t = useTheme();
  const { t: tr, locale } = useT();
  const quiz = useUserStore((s) => s.quiz);
  const setOnboarded = useUserStore((s) => s.setOnboarded);

  useEffect(() => {
    // Schedule the reminder they chose (permission prompt happens here, post-investment).
    if (quiz.prayerTime && quiz.prayerTime !== 'none') {
      NotificationService.requestPermission()
        .then((granted) => {
          if (granted) {
            NotificationService.scheduleDailyReminder(quiz.prayerTime as string);
            NotificationService.scheduleStreakSave();
          }
        })
        .catch(() => {}); // web / denied permissions must never crash the reveal
    }
  }, [quiz.prayerTime]);

  const goals = GOAL_LABELS[locale] ?? GOAL_LABELS.en!;
  const goal = (quiz.goals[0] && goals[quiz.goals[0]]) || goals.default;

  const items = [
    { icon: 'sunny-outline', text: tr('reveal.itemVerse') },
    { icon: 'book-outline', text: tr('reveal.itemDevotional') },
    { icon: 'flame-outline', text: `${tr('reveal.itemPrayers')} ${goal}` },
    { icon: 'moon-outline', text: tr('reveal.itemSleep') },
  ] as const;

  const finish = () => {
    setOnboarded(true);
    router.replace('/paywall?from=onboarding');
  };

  return (
    <Screen scroll={false} style={{ justifyContent: 'space-between' }}>
      <View>
        <Animated.View entering={FadeInDown.springify().damping(20)}>
          <ArtSlot
            id="A7-plan-crest"
            height={120}
            fit="contain"
            style={{ width: 120, marginTop: spacing.xl }}
          />
          <Text style={[ty.display, { color: t.ink, marginTop: spacing.lg }]}>
            {quiz.name ? `${quiz.name}, ${tr('reveal.planReadySuffix')}` : tr('reveal.planReady')}
          </Text>
          <Text style={[ty.body, { color: t.inkSoft, marginTop: spacing.md }]}>
            {tr('reveal.sub')}
          </Text>
        </Animated.View>
        <View style={{ gap: spacing.md, marginTop: spacing.xxl }}>
          {items.map((item, i) => (
            <Animated.View
              key={item.text}
              entering={FadeInDown.delay(200 + i * 150).springify().damping(20)}
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
      <PillButton label={tr('reveal.start')} onPress={finish} />
    </Screen>
  );
}
