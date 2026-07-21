import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { Screen } from '@/components/Screen';
import { PillButton } from '@/components/PillButton';
import { useTheme } from '@/hooks/useTheme';
import { fonts, type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { quizSteps } from '@/data/quiz';
import { useUserStore } from '@/state/useUserStore';

/** Step 0 = name entry, then quizSteps, with affirmation interstitials. */
export default function Quiz() {
  const t = useTheme();
  const setQuiz = useUserStore((s) => s.setQuiz);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [affirmation, setAffirmation] = useState<string | null>(null);

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
    if (current.multi) {
      setSelected((s) => (s.includes(value) ? s.filter((v) => v !== value) : [...s, value]));
    } else {
      setSelected([value]);
    }
  };

  if (affirmation) {
    return (
      <Screen scroll={false} style={{ justifyContent: 'center' }}>
        <Animated.View entering={FadeInDown.springify().damping(20)} exiting={FadeOut}>
          <Ionicons name="heart" size={36} color={t.gold} style={{ marginBottom: spacing.lg }} />
          <Text style={[ty.title, { color: t.ink }]}>{affirmation}</Text>
          <PillButton label="Continue" onPress={goNext} style={{ marginTop: spacing.xxl }} />
        </Animated.View>
      </Screen>
    );
  }

  return (
    <Screen scroll={false} style={{ justifyContent: 'space-between' }}>
      <View>
        {/* progress bar */}
        <View
          style={{
            height: 4,
            backgroundColor: t.surfaceAlt,
            borderRadius: 2,
            marginBottom: spacing.xxl,
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

        {step === 0 ? (
          <Animated.View key="name" entering={FadeInDown.springify().damping(20)}>
            <Text style={[ty.title, { color: t.ink }]}>What should we call you?</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your first name"
              placeholderTextColor={t.inkFaint}
              autoFocus
              accessibilityLabel="Your first name"
              style={{
                marginTop: spacing.xl,
                backgroundColor: t.surface,
                borderRadius: radius.inner,
                borderWidth: 1,
                borderColor: t.border,
                padding: spacing.lg,
                fontFamily: fonts.sans,
                fontSize: 18,
                color: t.ink,
              }}
            />
          </Animated.View>
        ) : current ? (
          <Animated.View key={current.key} entering={FadeInDown.springify().damping(20)}>
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
                      minHeight: 56,
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
          </Animated.View>
        ) : null}
      </View>

      <PillButton
        label={step + 1 >= total ? 'Create my plan' : 'Continue'}
        onPress={advance}
        disabled={step === 0 ? name.trim().length === 0 : selected.length === 0}
      />
    </Screen>
  );
}
