import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/components/Screen';
import { PillButton } from '@/components/PillButton';
import { useTheme } from '@/hooks/useTheme';
import { fonts, type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { FALLBACK_PLANS, purchase, restore, type PlanId } from '@/services/purchases';
import { useEntitlementStore } from '@/state/useEntitlementStore';

const BENEFITS = [
  'Full guided prayer & sleep library',
  'Every reading plan, incl. Bible in a Year',
  'Unlimited “write my prayer”',
  'Journal sync & export',
];

export default function Paywall() {
  const t = useTheme();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const [selected, setSelected] = useState<PlanId>('annual');
  const [busy, setBusy] = useState(false);
  const [thanks, setThanks] = useState(false);
  const { sawDiscountOffer, setSawDiscountOffer } = useEntitlementStore();

  const buy = async () => {
    setBusy(true);
    try {
      const ok = await purchase(selected);
      if (ok) setThanks(true);
    } catch {
      Alert.alert('Purchase failed', 'Nothing was charged. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const close = () => {
    // One-time dismiss offer (win-back) before closing from onboarding.
    if (from === 'onboarding' && !sawDiscountOffer) {
      setSawDiscountOffer(true);
      Alert.alert(
        'A gift before you go',
        'Get your first year 50% off — this offer won’t appear again.',
        [
          { text: 'No thanks', style: 'cancel', onPress: () => router.replace('/(tabs)/today') },
          { text: 'Claim 50% off', onPress: buy },
        ],
      );
      return;
    }
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/today');
  };

  if (thanks) {
    // Post-purchase charity reframe (reduces refunds/churn — see docs/monetization.md).
    return (
      <Screen scroll={false} style={{ justifyContent: 'center' }}>
        <Ionicons name="heart-circle" size={56} color={t.gold} style={{ marginBottom: spacing.lg }} />
        <Text style={[ty.title, { color: t.ink }]}>Your light reaches further.</Text>
        <Text style={[ty.body, { color: t.inkSoft, marginTop: spacing.md }]}>
          Part of every subscription gives Lumen free to someone who can’t afford
          it. Thank you for praying it forward.
        </Text>
        <PillButton
          label="Amen — let’s begin"
          onPress={() => router.replace('/(tabs)/today')}
          style={{ marginTop: spacing.xxl }}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Pressable
        onPress={close}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Close"
        style={{ alignSelf: 'flex-end', width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
      >
        <Ionicons name="close" size={26} color={t.inkFaint} />
      </Pressable>

      <LinearGradient
        colors={[t.duskFrom, t.duskTo]}
        style={{ borderRadius: radius.card, padding: spacing.xl, marginBottom: spacing.xl }}
      >
        <Text style={{ fontFamily: fonts.serif, fontSize: 26, color: '#F2EEE6' }}>
          Go deeper with Lumen Plus
        </Text>
        <View style={{ gap: spacing.sm, marginTop: spacing.lg }}>
          {BENEFITS.map((b) => (
            <View key={b} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Ionicons name="checkmark-circle" size={18} color="#D9A441" />
              <Text style={{ fontFamily: fonts.sans, fontSize: 15, color: '#F2EEE6' }}>{b}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <View style={{ gap: spacing.md }}>
        {FALLBACK_PLANS.map((p) => {
          const active = selected === p.id;
          return (
            <Pressable
              key={p.id}
              onPress={() => setSelected(p.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${p.title} ${p.price} ${p.period}`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: active ? t.goldSoft : t.surface,
                borderWidth: 2,
                borderColor: active ? t.gold : t.border,
                borderRadius: radius.inner,
                padding: spacing.lg,
                gap: spacing.md,
              }}
            >
              <Ionicons
                name={active ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={active ? t.gold : t.inkFaint}
              />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 17, color: t.ink }}>
                    {p.title}
                  </Text>
                  {p.badge ? (
                    <View
                      style={{
                        backgroundColor: t.gold,
                        borderRadius: radius.pill,
                        paddingHorizontal: spacing.sm,
                        paddingVertical: 2,
                      }}
                    >
                      <Text style={{ fontFamily: fonts.sansBold, fontSize: 11, color: t.onGold }}>
                        {p.badge}
                      </Text>
                    </View>
                  ) : null}
                </View>
                {p.trialDays ? (
                  <Text style={{ fontFamily: fonts.sans, fontSize: 13, color: t.inkSoft }}>
                    {p.trialDays}-day free trial, cancel anytime
                  </Text>
                ) : null}
              </View>
              <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 16, color: t.ink }}>
                {p.price}
                <Text style={{ fontFamily: fonts.sans, fontSize: 13, color: t.inkSoft }}>
                  {' '}{p.period}
                </Text>
              </Text>
            </Pressable>
          );
        })}
      </View>

      <PillButton
        label={selected === 'annual' ? 'Start 7-day free trial' : 'Continue'}
        onPress={buy}
        disabled={busy}
        style={{ marginTop: spacing.xl }}
      />
      <Pressable onPress={() => restore()} style={{ marginTop: spacing.lg, minHeight: 44, justifyContent: 'center' }}>
        <Text style={{ fontFamily: fonts.sans, fontSize: 14, color: t.blue, textAlign: 'center' }}>
          Restore purchases
        </Text>
      </Pressable>
      <Text
        style={{
          fontFamily: fonts.sans,
          fontSize: 12,
          color: t.inkFaint,
          textAlign: 'center',
          marginTop: spacing.md,
        }}
      >
        Auto-renews unless cancelled 24h before period end. Terms · Privacy
      </Text>
    </Screen>
  );
}
