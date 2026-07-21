import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/components/Screen';
import { PillButton } from '@/components/PillButton';
import { ArtSlot } from '@/components/ArtSlot';
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

/** Per-plan supporting copy (equivalent pricing sells the annual). */
const SUBCOPY: Record<PlanId, string> = {
  annual: 'Just $4.99/mo, billed yearly · 7-day free trial',
  weekly: 'For a short season',
  lifetime: 'One gift, forever',
};

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
    // Post-purchase charity reframe + immediate value redemption.
    return (
      <Screen scroll={false} style={{ justifyContent: 'center' }}>
        <ArtSlot
          id="A9-thanks-sharing"
          height={180}
          fit="contain"
          style={{ width: 180, alignSelf: 'center', marginBottom: spacing.xl }}
        />
        <Text style={[ty.title, { color: t.ink, textAlign: 'center' }]}>
          Your light reaches further.
        </Text>
        <Text style={[ty.body, { color: t.inkSoft, marginTop: spacing.md, textAlign: 'center' }]}>
          Part of every subscription gives Lumen free to someone who can’t afford
          it. Thank you for praying it forward.
        </Text>
        <PillButton
          label="Begin with tonight’s sleep prayer"
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
        style={({ pressed }) => ({
          alignSelf: 'flex-end',
          width: 44,
          height: 44,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <Ionicons name="close" size={26} color={t.inkFaint} />
      </Pressable>

      {/* Hero: sunrise-through-arch artwork with scrim + copy */}
      <View style={{ borderRadius: radius.hero, overflow: 'hidden', marginBottom: spacing.md }}>
        <ArtSlot id="A8-paywall-hero" height={260} radius={radius.hero}>
          <LinearGradient
            colors={['rgba(14,18,32,0.15)', 'rgba(14,18,32,0.9)']}
            style={{ position: 'absolute', width: '100%', height: '100%' }}
          />
          <View style={{ flex: 1, justifyContent: 'flex-end', padding: spacing.xl }}>
            <Text style={{ fontFamily: fonts.serif, fontSize: 27, color: '#F2EEE6' }}>
              Go deeper with Lumen Plus
            </Text>
            <View style={{ gap: spacing.xs, marginTop: spacing.md }}>
              {BENEFITS.map((b) => (
                <View key={b} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <Ionicons name="checkmark-circle" size={16} color="#D9A441" />
                  <Text style={{ fontFamily: fonts.sans, fontSize: 14, color: '#F2EEE6' }}>{b}</Text>
                </View>
              ))}
            </View>
          </View>
        </ArtSlot>
      </View>

      {/* Social proof */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          marginBottom: spacing.xl,
        }}
      >
        <Ionicons name="star" size={13} color={t.gold} />
        <Text style={{ fontFamily: fonts.sansMedium, fontSize: 13, color: t.inkSoft }}>
          4.9 · loved by a growing community of daily prayer
        </Text>
      </View>

      <View style={{ gap: spacing.md }}>
        {FALLBACK_PLANS.map((p) => {
          const active = selected === p.id;
          const quiet = p.id === 'weekly'; // anchor, not the sell
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
                backgroundColor: active ? t.goldSoft : quiet ? 'transparent' : t.surface,
                borderWidth: active ? 2 : 1,
                borderColor: active ? t.gold : t.border,
                borderRadius: radius.inner,
                padding: spacing.lg,
                gap: spacing.md,
                minHeight: 64,
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
                <Text style={{ fontFamily: fonts.sans, fontSize: 13, color: t.inkSoft, marginTop: 2 }}>
                  {SUBCOPY[p.id]}
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: fonts.sansSemiBold,
                  fontSize: 16,
                  color: t.ink,
                  fontVariant: ['tabular-nums'],
                }}
              >
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

      {/* Trial reassurance — the #1 objection killer */}
      {selected === 'annual' ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            marginTop: spacing.md,
          }}
        >
          <Ionicons name="notifications-outline" size={14} color={t.inkSoft} />
          <Text style={{ fontFamily: fonts.sans, fontSize: 13, color: t.inkSoft }}>
            We’ll remind you 2 days before your trial ends.
          </Text>
        </View>
      ) : null}

      <Pressable
        onPress={() => restore()}
        style={({ pressed }) => ({
          marginTop: spacing.lg,
          minHeight: 44,
          justifyContent: 'center',
          opacity: pressed ? 0.6 : 1,
        })}
      >
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
