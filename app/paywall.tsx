import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/components/Screen';
import { PillButton } from '@/components/PillButton';
import { ArtSlot } from '@/components/ArtSlot';
import { useTheme } from '@/hooks/useTheme';
import { useArtwork } from '@/hooks/useArtwork';
import { fonts, type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import {
  loadPlans,
  purchase,
  restore,
  type PlanId,
  type PurchaseCatalog,
  type PurchasePlan,
} from '@/services/purchases';
import { useT } from '@/i18n';
import {
  resolvePaywallContext,
  type BenefitId,
} from '@/services/paywallContext.logic';

const configuredSupportEmail = process.env.EXPO_PUBLIC_SUPPORT_EMAIL?.trim() ?? '';
const supportEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(configuredSupportEmail)
  ? configuredSupportEmail
  : null;

export default function Paywall() {
  const t = useTheme();
  const artwork = useArtwork();
  const dawn = artwork.scheme === 'dawn';
  const { t: tr, locale } = useT();
  const { from } = useLocalSearchParams<{ from?: string | string[] }>();
  const paywallContext = resolvePaywallContext(from);
  const benefitStrings: Record<BenefitId, string> = {
    1: tr('paywall.b1'),
    2: tr('paywall.b2'),
    3: tr('paywall.b3'),
    4: tr('paywall.b4'),
  };
  const BENEFITS = paywallContext.benefits.map((id) => benefitStrings[id]);
  const PLAN_TITLE: Record<PlanId, string> = {
    annual: tr('paywall.yearly'),
    monthly: tr('paywall.monthly'),
    lifetime: tr('paywall.lifetime'),
  };
  const PLAN_PERIOD: Record<PlanId, string> = {
    annual: tr('paywall.perYear'),
    monthly: tr('paywall.perMonth'),
    lifetime: tr('paywall.once'),
  };
  const [selected, setSelected] = useState<PlanId>('annual');
  const [catalog, setCatalog] = useState<PurchaseCatalog | null>(null);
  const [busy, setBusy] = useState(false);
  const [thanks, setThanks] = useState(false);
  const [pending, setPending] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<'idle' | 'busy' | 'found' | 'missing'>('idle');
  const refreshCatalog = () => {
    setCatalog(null);
    loadPlans().then((next) => {
      setCatalog(next);
      if (next.status === 'ready') {
        setSelected((current) =>
          next.plans.some((p) => p.id === current) ? current : next.plans[0].id,
        );
      }
    });
  };

  useEffect(refreshCatalog, []);

  const plans = catalog?.status === 'ready' ? catalog.plans : [];
  const selectedPlan = plans.find((p) => p.id === selected);
  const subcopy = (plan: PurchasePlan) => {
    if (plan.id === 'annual' && plan.monthlyPrice) {
      const trialCopy = plan.trialEligible
        ? plan.trialDays === 7
          ? tr('paywall.trialCta')
          : tr('paywall.trialCtaGeneric')
        : null;
      return `${plan.monthlyPrice}${tr('paywall.perMonth')}${trialCopy ? ` · ${trialCopy}` : ''}`;
    }
    return plan.id === 'monthly' ? tr('paywall.monthlySub') : tr('paywall.lifetimeSub');
  };

  const buy = async () => {
    if (!selectedPlan || busy || pending) return;
    setBusy(true);
    setPending(false);
    try {
      const result = await purchase(selectedPlan.id);
      if (result.status === 'purchased') setThanks(true);
      else if (result.status === 'pending') setPending(true);
      else if (result.status === 'failed') {
        Alert.alert(tr('paywall.purchaseFailTitle'), tr('paywall.purchaseFailBody'));
      } else if (result.status === 'unavailable') {
        setCatalog({ status: 'unavailable', plans: [], mock: false });
      }
    } catch {
      Alert.alert(tr('paywall.purchaseFailTitle'), tr('paywall.purchaseFailBody'));
    } finally {
      setBusy(false);
    }
  };

  const close = () => {
    // The onboarding route is replaced by this paywall. Going "back" here can
    // return to an earlier onboarding screen and trap people in the funnel.
    if (from === 'onboarding') {
      router.replace('/(tabs)/today');
      return;
    }
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

  const contactSupport = async () => {
    if (!supportEmail) return;
    const url = `mailto:${supportEmail}?subject=${encodeURIComponent(tr('paywall.supportSubject'))}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(tr('paywall.supportErrorTitle'), tr('paywall.supportErrorBody'));
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

  if (!catalog) {
    return (
      <Screen scroll={false} style={{ alignItems: 'center', justifyContent: 'center', gap: spacing.md }}>
        <ActivityIndicator color={t.gold} />
        <Text accessibilityRole="alert" style={[ty.secondary, { color: t.inkSoft, textAlign: 'center' }]}>
          {tr('paywall.processing')}
        </Text>
      </Screen>
    );
  }

  if (catalog.status === 'unavailable') {
    return (
      <Screen scroll={false} style={{ justifyContent: 'center' }}>
        <Text style={[ty.title, { color: t.ink, textAlign: 'center' }]}>
          {tr('paywall.purchaseFailTitle')}
        </Text>
        <Text style={[ty.body, { color: t.inkSoft, textAlign: 'center', marginTop: spacing.md }]}>
          {tr('paywall.purchaseFailBody')}
        </Text>
        <PillButton label={tr('paywall.retry')} onPress={refreshCatalog} style={{ marginTop: spacing.xl }} />
        <PillButton label={tr('a11y.close')} onPress={close} variant="ghost" style={{ marginTop: spacing.sm }} />
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
        <ArtSlot
          id={paywallContext.hero}
          radius={radius.hero}
          variant={dawn ? 'card' : 'bare'}
          style={{ minHeight: 260 }}
        >
          {!dawn ? (
            <LinearGradient
              colors={['rgba(14,18,32,0.15)', 'rgba(14,18,32,0.9)']}
              style={{ position: 'absolute', width: '100%', height: '100%' }}
            />
          ) : null}
          <View style={{ flex: 1, justifyContent: 'flex-end', padding: spacing.xl }}>
            <Text style={{ fontFamily: fonts.serif, fontSize: 27, color: dawn ? t.ink : '#F2EEE6' }}>
{tr(paywallContext.titleKey)}
            </Text>
            <View style={{ gap: spacing.xs, marginTop: spacing.md }}>
              {BENEFITS.map((b) => (
                <View key={b} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <Ionicons name="checkmark-circle" size={16} color={t.gold} />
                  <Text style={{ fontFamily: fonts.sans, fontSize: 14, color: dawn ? t.inkSoft : '#F2EEE6', flex: 1 }}>{b}</Text>
                </View>
              ))}
            </View>
          </View>
        </ArtSlot>
      </View>

      <View style={{ gap: spacing.md }}>
        {plans.map((p) => {
          const active = selected === p.id;
          const quiet = p.id === 'monthly'; // flexible option, not the primary sell
          return (
            <Pressable
              key={p.id}
              onPress={() => setSelected(p.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${PLAN_TITLE[p.id]} ${p.price} ${PLAN_PERIOD[p.id]}`}
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
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
              <View style={{ flexGrow: 1, flexBasis: 180 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 17, color: t.ink }}>
{PLAN_TITLE[p.id]}
                  </Text>
                </View>
                <Text style={{ fontFamily: fonts.sans, fontSize: 13, color: t.inkSoft, marginTop: 2 }}>
                  {subcopy(p)}
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
          pending
            ? tr('paywall.pendingTitle')
            : busy
            ? tr('paywall.processing')
            : selectedPlan?.trialEligible
              ? selectedPlan.trialDays === 7
                ? tr('paywall.trialCta')
                : tr('paywall.trialCtaGeneric')
              : tr('paywall.continue')
        }
        onPress={buy}
        busy={busy}
        disabled={pending || !selectedPlan}
        style={{ marginTop: spacing.xl }}
      />

      {pending ? (
        <View
          accessibilityRole="alert"
          style={{
            marginTop: spacing.md,
            padding: spacing.lg,
            borderRadius: radius.inner,
            backgroundColor: t.goldSoft,
          }}
        >
          <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 15, color: t.ink, textAlign: 'center' }}>
            {tr('paywall.pendingTitle')}
          </Text>
          <Text style={{ fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: t.inkSoft, textAlign: 'center', marginTop: spacing.xs }}>
            {tr('paywall.pendingBody')}
          </Text>
        </View>
      ) : null}

      {selectedPlan?.trialEligible && selectedPlan.trialDays ? (
        <View style={{ marginTop: spacing.md, gap: spacing.xs }}>
          <Text style={{ fontFamily: fonts.sansMedium, fontSize: 13, lineHeight: 19, color: t.ink, textAlign: 'center' }}>
            {tr('paywall.trialEnds')}{' '}
            {new Intl.DateTimeFormat(locale, {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }).format(new Date(Date.now() + selectedPlan.trialDays * 86_400_000))}
            . {selectedPlan.price} {PLAN_PERIOD[selectedPlan.id]}.
          </Text>
          <Text style={{ fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, color: t.inkSoft, textAlign: 'center' }}>
            {tr('paywall.reassure')}
          </Text>
        </View>
      ) : null}

      {restoreStatus !== 'missing' ? (
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
      ) : null}
      {restoreStatus === 'missing' ? (
        <View
          accessibilityRole="alert"
          style={{
            marginTop: spacing.lg,
            padding: spacing.lg,
            borderRadius: radius.inner,
            backgroundColor: t.surfaceAlt,
          }}
        >
          <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 15, color: t.ink }}>
            {tr('paywall.restoreMissingTitle')}
          </Text>
          <Text
            style={{
              fontFamily: fonts.sans,
              fontSize: 13,
              lineHeight: 19,
              color: t.inkSoft,
              marginTop: spacing.xs,
            }}
          >
            {tr('paywall.restoreMissing')}
          </Text>
          <Pressable
            onPress={restorePurchase}
            accessibilityRole="button"
            accessibilityLabel={tr('paywall.retry')}
            style={({ pressed }) => ({
              minHeight: 48,
              justifyContent: 'center',
              marginTop: spacing.sm,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Text style={{ fontFamily: fonts.sansMedium, fontSize: 14, color: t.blue }}>
              {tr('paywall.retry')}
            </Text>
          </Pressable>
          {supportEmail ? (
            <Pressable
              onPress={contactSupport}
              accessibilityRole="button"
              accessibilityLabel={tr('paywall.contactSupport')}
              style={({ pressed }) => ({
                minHeight: 48,
                justifyContent: 'center',
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Text style={{ fontFamily: fonts.sansMedium, fontSize: 14, color: t.blue }}>
                {tr('paywall.contactSupport')}
              </Text>
            </Pressable>
          ) : null}
        </View>
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
