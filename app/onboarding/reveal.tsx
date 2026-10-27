import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { PillButton } from '@/components/PillButton';
import { ArtSlot } from '@/components/ArtSlot';
import { OnboardingBackdrop } from '@/components/OnboardingBackdrop';
import { useTheme } from '@/hooks/useTheme';
import { fonts, type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { useUserStore } from '@/state/useUserStore';
import * as NotificationService from '@/services/notifications';
import { useT } from '@/i18n';
import type { Locale } from '@/i18n/translations';
import { getQuizSteps } from '@/data/quiz';
import { useStreakStore } from '@/state/useStreakStore';
import { dayKey } from '@/lib/dates';

// Hand-written goal phrases for the "Guided prayers: …" line. Other locales use
// the localized quiz option label, so no language shows English mid-sentence.
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
  it: {
    habit: 'un’abitudine quotidiana stabile', closer: 'vicinanza a Dio', peace: 'pace al posto dell’ansia',
    sleep: 'un sonno sereno', bible: 'comprendere la Scrittura', gratitude: 'un cuore riconoscente',
    default: 'una vita di preghiera più profonda',
  },
  nl: {
    habit: 'een vast dagelijks ritme', closer: 'dichter bij God zijn', peace: 'vrede in plaats van angst',
    sleep: 'rustige slaap', bible: 'de Schrift begrijpen', gratitude: 'een dankbaar hart',
    default: 'een dieper gebedsleven',
  },
};

/** Personalized plan reveal — the moment before the paywall. */
export default function Reveal() {
  const t = useTheme();
  const { t: tr, locale } = useT();
  const quiz = useUserStore((s) => s.quiz);
  const setQuiz = useUserStore((s) => s.setQuiz);
  const setOnboarded = useUserStore((s) => s.setOnboarded);

  useEffect(() => {
    // Schedule the reminder they chose (permission prompt happens here, post-investment).
    const time = quiz.prayerTime;
    if (!time || time === 'none') return;
    let active = true;
    (async () => {
      try {
        if (!(await NotificationService.requestPermission())) throw new Error('denied');
        const streak = useStreakStore.getState();
        await NotificationService.scheduleDailyReminder(time);
        await NotificationService.scheduleStreakSave({
          doneToday: streak.doneDay === dayKey() && streak.doneSteps.length > 0,
          reminder: time,
        });
      } catch {
        // Denied/unsupported: record that no reminder exists, so Profile
        // doesn't claim one is set. Web/denied must never crash the reveal.
        if (active) setQuiz({ prayerTime: 'none' });
      }
    })();
    return () => {
      active = false;
    };
    // Run once for the answer given in the quiz.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goalKey = quiz.goals[0];
  const handWritten = GOAL_LABELS[locale];
  const optionLabel = goalKey
    ? getQuizSteps(locale).find((step) => step.key === 'goals')?.options.find((o) => o.value === goalKey)?.label
    : undefined;
  const goal =
    (handWritten && goalKey && handWritten[goalKey]) ||
    optionLabel ||
    handWritten?.default ||
    GOAL_LABELS.en!.default;

  const prayersLabel = tr('reveal.itemPrayers');
  const items = [
    { icon: 'sunny-outline', text: tr('reveal.itemVerse') },
    { icon: 'book-outline', text: tr('reveal.itemDevotional') },
    // Full-width CJK colons already carry their own spacing.
    { icon: 'flame-outline', text: `${prayersLabel}${prayersLabel.endsWith('：') ? '' : ' '}${goal}` },
    { icon: 'moon-outline', text: tr('reveal.itemSleep') },
  ] as const;

  const finish = () => {
    setOnboarded(true);
    router.replace('/paywall?from=onboarding');
  };

  return (
    <Screen scroll={false} style={{ justifyContent: 'space-between' }}>
      <OnboardingBackdrop />
      <View>
        <View>
          <ArtSlot
            id="A7-plan-crest"
            height={120}
            fit="contain"
            style={{ width: 120, alignSelf: 'center', marginTop: spacing.xl }}
          />
          <Text accessibilityRole="header" style={[ty.display, { color: t.ink, marginTop: spacing.lg }]}>
            {quiz.name
              ? tr('format.nameFirst', { name: quiz.name, text: tr('reveal.planReadySuffix') })
              : tr('reveal.planReady')}
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
              <Text style={{ fontFamily: fonts.sansMedium, fontSize: 15, color: t.ink, flex: 1 }}>
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
