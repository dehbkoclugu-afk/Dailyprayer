import React, { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/components/Screen';
import { PillButton } from '@/components/PillButton';
import { ArtSlot } from '@/components/ArtSlot';
import { useTheme } from '@/hooks/useTheme';
import { fonts, type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { getQuizSteps } from '@/data/quiz';
import { useUserStore } from '@/state/useUserStore';
import { useT } from '@/i18n';

/** Step 0 = name entry, then quizSteps, with affirmation interstitials. */
export default function Quiz() {
  const t = useTheme();
  const { t: tr, locale } = useT();
  const quizSteps = useMemo(() => getQuizSteps(locale), [locale]);
  const setQuiz = useUserStore((s) => s.setQuiz);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [affirmation, setAffirmation] = useState<string | null>(null);
  const [nameFocused, setNameFocused] = useState(false);

  const total = quizSteps.length + 1;
  const progress = (step + 1) / total;
  const current = step === 0 ? null : quizSteps[step - 1];

  const advance = () => {
    if (step === 0) {
      setQuiz({ name: name.trim() });
    } else if (current) {
      const value = current.multi ? selected : selected[0] ?? null;
      setQuiz({ [current.key]: value } as never);
      if (current.affirmation) {
        setAffirmation(current.affirmation);
        return; // interstitial handles the next advance
      }
    }
    goNext();
  };

  const goNext = () => {
    setAffirmation(null);
    setSelected([]);
    if (step + 1 >= total) {
      router.replace('/onboarding/building');
    } else {
      setStep(step + 1);
    }
  };

  const toggle = (value: string) => {
    if (!current) return;
    Haptics.selectionAsync().catch(() => {});
    if (current.multi) {
      setSelected((s) => (s.includes(value) ? s.filter((v) => v !== value) : [...s, value]));
    } else {
      setSelected([value]);
    }
  };

  if (affirmation) {
    return (
      <Screen scroll={false} style={{ justifyContent: 'center' }}>
        <View>
          <ArtSlot
            id="A6-affirmation-spot"
            height={120}
            fit="contain"
            style={{ width: 120, marginBottom: spacing.xl }}
          />
          <Text style={[ty.title, { color: t.ink }]}>{affirmation}</Text>
          <PillButton label={tr('quiz.continue')} onPress={goNext} style={{ marginTop: spacing.xxl }} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll={false} style={{ justifyContent: 'space-between' }}>
      <View>
        {/* progress bar + step counter */}
        <View style={{ marginBottom: spacing.xxl }}>
          <View
            style={{
              height: 4,
              backgroundColor: t.surfaceAlt,
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: `${progress * 100}%`,
                height: '100%',
                backgroundColor: t.gold,
                borderRadius: 2,
              }}
            />
          </View>
          <Text
            style={{
              fontFamily: fonts.sansMedium,
              fontSize: 12,
              color: t.inkFaint,
              textAlign: 'right',
              marginTop: spacing.sm,
              fontVariant: ['tabular-nums'],
            }}
          >
            {step + 1} {tr('quiz.stepOf')} {total}
          </Text>
        </View>

        {step === 0 ? (
          <View key="name">
            <Text style={[ty.title, { color: t.ink }]}>{tr('quiz.namePrompt')}</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={tr('quiz.namePlaceholder')}
              placeholderTextColor={t.inkFaint}
              autoFocus
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
              accessibilityLabel={tr('a11y.firstName')}
              style={{
                marginTop: spacing.xl,
                backgroundColor: t.surface,
                borderRadius: radius.inner,
                borderWidth: 1.5,
                borderColor: nameFocused ? t.gold : t.border,
                padding: spacing.lg,
                fontFamily: fonts.sans,
                fontSize: 18,
                color: t.ink,
              }}
            />
            <Text
              style={{
                fontFamily: fonts.sans,
                fontSize: 13,
                color: t.inkFaint,
                marginTop: spacing.sm,
              }}
            >
{tr('quiz.nameNote')}
            </Text>
          </View>
        ) : current ? (
          // Plain View — no reanimated entering/exiting here: on the old
          // architecture the exiting layout copy lingers over the next step and
          // swallows taps on the option buttons, trapping the user in the quiz.
          <View key={current.key}>
            <Text style={[ty.title, { color: t.ink }]}>{current.question}</Text>
            {current.subtitle ? (
              <Text style={[ty.secondary, { color: t.inkSoft, marginTop: spacing.sm }]}>
                {current.subtitle}
              </Text>
            ) : null}
            <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
              {current.options.map((o) => {
                const active = selected.includes(o.value);
                return (
                  <Pressable
                    key={o.value}
                    onPress={() => toggle(o.value)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={o.label}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.md,
                      backgroundColor: active ? t.goldSoft : t.surface,
                      borderColor: active ? t.gold : t.border,
                      borderWidth: 1,
                      borderRadius: radius.inner,
                      padding: spacing.lg,
                      minHeight: 60,
                      // selected options glow like embers (design-100 #14)
                      ...(active
                        ? {
                            shadowColor: t.gold,
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.3,
                            shadowRadius: 12,
                            elevation: 4,
                          }
                        : null),
                    }}
                  >
                    <Ionicons
                      name={o.icon as keyof typeof Ionicons.glyphMap}
                      size={20}
                      color={active ? t.gold : t.inkSoft}
                    />
                    <Text
                      style={{
                        fontFamily: active ? fonts.sansSemiBold : fonts.sans,
                        fontSize: 16,
                        color: t.ink,
                        flex: 1,
                      }}
                    >
                      {o.label}
                    </Text>
                    {active ? <Ionicons name="checkmark" size={20} color={t.gold} /> : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}
      </View>

      <PillButton
        label={step + 1 >= total ? tr('quiz.createPlan') : tr('quiz.continue')}
        onPress={advance}
        disabled={step === 0 ? name.trim().length === 0 : selected.length === 0}
      />
    </Screen>
  );
}
