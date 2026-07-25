import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/components/Screen';
import { PillButton } from '@/components/PillButton';
import { ArtSlot } from '@/components/ArtSlot';
import { useTheme } from '@/hooks/useTheme';
import { fonts, type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { FALLBACK_PLANS, purchase, restore, type PlanId } from '@/services/purchases';
import { useT } from '@/i18n';


export default function Paywall() {
  const t = useTheme();
  const { t: tr, locale } = useT();
  const BENEFITS = [tr('paywall.b1'), tr('paywall.b2'), tr('paywall.b3'), tr('paywall.b4')];
  const SUBCOPY: Record<PlanId, string> = {
    annual: tr('paywall.yearlySub'),
    weekly: tr('paywall.weeklySub'),
    lifetime: tr('paywall.lifetimeSub'),
  };
  const PLAN_TITLE: Record<PlanId, string> = {
    annual: tr('paywall.yearly'),
    weekly: tr('paywall.weekly'),
    lifetime: tr('paywall.lifetime'),
  };
  const PLAN_PERIOD: Record<PlanId, string> = {
    annual: tr('paywall.perYear'),
    weekly: tr('paywall.perWeek'),
    lifetime: tr('paywall.once'),
  };
  const [selected, setSelected] = useState<PlanId>('annual');
  const [busy, setBusy] = useState(false);
  const [thanks, setThanks] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<'idle' | 'busy' | 'found' | 'missing'>('idle');
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 7);
  const trialEndLabel = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(trialEnd);

  const buy = async () => {
    setBusy(true);
    try {
      const ok = await purchase(selected);
      if (ok) setThanks(true);
    } catch {
      Alert.alert(tr('paywall.purchaseFailTitle'), tr('paywall.purchaseFailBody'));
    } finally {
      setBusy(false);
    }
  };

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/today');
  };

  const restorePurchase = async () => {
    if (restoreStatus === 'busy') return;
    setRestoreStatus('busy');
    try {
      const restored = await restore();
      setRestoreStatus(restored ? 'found' : 'missing');
      if (restored) setThanks(true);
    } catch {
      setRestoreStatus('idle');
      Alert.alert(tr('paywall.restoreErrorTitle'), tr('paywall.restoreErrorBody'));
    }
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
{tr('paywall.thanksTitle')}
        </Text>
        <Text style={[ty.body, { color: t.inkSoft, marginTop: spacing.md, textAlign: 'center' }]}>
{tr('paywall.thanksBody')}
        </Text>
        <PillButton
          label={tr('paywall.thanksCta')}
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
        accessibilityLabel={tr('a11y.close')}
        style={({ pressed }) => ({
          alignSelf: 'flex-end',
          width: 48,
          height: 48,
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
{tr('paywall.title')}
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
              accessibilityLabel={`${PLAN_TITLE[p.id]} ${p.price} ${PLAN_PERIOD[p.id]}`}
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
{PLAN_TITLE[p.id]}
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
{tr('paywall.save')}
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
{' '}{PLAN_PERIOD[p.id]}
                </Text>
              </Text>
            </Pressable>
          );
        })}
      </View>

      <PillButton
        label={
          busy
            ? tr('paywall.processing')
            : selected === 'annual'
              ? tr('paywall.trialCta')
              : tr('paywall.continue')
        }
        onPress={buy}
        disabled={busy}
        style={{ marginTop: spacing.xl }}
      />
      {busy ? (
        <View
          accessibilityRole="progressbar"
          accessibilityLabel={tr('paywall.processing')}
          style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.md }}
        >
          <ActivityIndicator color={t.gold} />
          <Text style={{ fontFamily: fonts.sans, fontSize: 13, color: t.inkSoft }}>
            {tr('paywall.processing')}
          </Text>
        </View>
      ) : null}

      {/* Trial reassurance — the #1 objection killer */}
      {selected === 'annual' ? (
        <View style={{ marginTop: spacing.md, gap: spacing.xs }}>
          <Text style={{ fontFamily: fonts.sansMedium, fontSize: 13, lineHeight: 19, color: t.ink, textAlign: 'center' }}>
            {tr('paywall.trialEnds')} {trialEndLabel}. {tr('paywall.thenAnnual')}
          </Text>
          <Text style={{ fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, color: t.inkSoft, textAlign: 'center' }}>
            {tr('paywall.reassure')}
          </Text>
        </View>
      ) : null}

      <Pressable
        onPress={restorePurchase}
        disabled={restoreStatus === 'busy'}
        accessibilityRole="button"
        accessibilityState={{ busy: restoreStatus === 'busy', disabled: restoreStatus === 'busy' }}
        accessibilityLabel={tr('paywall.restore')}
        style={({ pressed }) => ({
          marginTop: spacing.lg,
          minHeight: 48,
          justifyContent: 'center',
          opacity: restoreStatus === 'busy' ? 0.5 : pressed ? 0.6 : 1,
        })}
      >
        <Text style={{ fontFamily: fonts.sans, fontSize: 14, color: t.blue, textAlign: 'center' }}>
          {restoreStatus === 'busy' ? tr('paywall.restoring') : tr('paywall.restore')}
        </Text>
      </Pressable>
      {restoreStatus === 'missing' ? (
        <Text
          accessibilityRole="alert"
          style={{ fontFamily: fonts.sans, fontSize: 13, color: t.inkSoft, textAlign: 'center' }}
        >
          {tr('paywall.restoreMissing')}
        </Text>
      ) : null}
      <Text
        style={{
          fontFamily: fonts.sans,
          fontSize: 12,
          color: t.inkFaint,
          textAlign: 'center',
          marginTop: spacing.md,
        }}
      >
{tr('paywall.legalPrefix')}
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.lg, marginTop: 6 }}>
        <Pressable
          onPress={() => router.push({ pathname: '/legal', params: { doc: 'terms' } })}
          accessibilityRole="link"
          style={{ minHeight: 48, justifyContent: 'center' }}
        >
          <Text style={{ fontFamily: fonts.sansMedium, fontSize: 13, color: t.blue }}>
            {tr('paywall.termsLink')}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push({ pathname: '/legal', params: { doc: 'privacy' } })}
          accessibilityRole="link"
          style={{ minHeight: 48, justifyContent: 'center' }}
        >
          <Text style={{ fontFamily: fonts.sansMedium, fontSize: 13, color: t.blue }}>
            {tr('paywall.privacyLink')}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
