import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { useTheme } from '@/hooks/useTheme';
import { type, type as ty } from '@/theme/typography';
import { radius, spacing, TAP_MIN } from '@/theme/tokens';
import { usePrayers, prayerCategories, type GuidedPrayer } from '@/data/prayers';
import { useEntitlementStore } from '@/state/useEntitlementStore';
import { useT } from '@/i18n';
import { ArtSlot } from '@/components/ArtSlot';
import { categoryArt } from '@/assets/registry';

export default function Pray() {
  const t = useTheme();
  const { t: tr, tf } = useT();
  const isPlus = useEntitlementStore((s) => s.isPlus);
  const prayers = usePrayers();
  const [cat, setCat] = useState<GuidedPrayer['category'] | 'all'>('all');
  const list = cat === 'all' ? prayers : prayers.filter((p) => p.category === cat);

  const open = (p: GuidedPrayer) => {
    if (p.plus && !isPlus) router.push('/paywall?from=prayer');
    else router.push({ pathname: '/player', params: { id: p.id } });
  };

  return (
    <Screen tabbed>
      <Text style={[ty.title, { color: t.ink }]}>{tr('pray.title')}</Text>
      <Text style={[ty.callout, { color: t.inkSoft, marginTop: spacing.xs }]}>
{tr('pray.sub')}
      </Text>

      <Text style={{ ...type.headingSans, color: t.ink, marginTop: spacing.xxl, marginBottom: spacing.md }}>
        {tr('pray.categories')}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
        {prayerCategories.map((c) => {
          const active = cat === c.key;
          const art = categoryArt(c.key);
          return (
            <Pressable
              key={c.key}
              onPress={() => setCat(active ? 'all' : c.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={tr(`cat.${c.key}` as never)}
              style={({ pressed }) => ({ width: '47.8%', opacity: pressed ? 0.75 : 1 })}
            >
              {art ? (
                <ArtSlot id={art} height={112} radius={radius.inner}>
                  <View style={{ flex: 1, justifyContent: 'flex-end', padding: spacing.md, backgroundColor: 'rgba(10,12,24,0.72)' }}>
                    <Text style={{ ...type.calloutSemi, color: '#F2EEE6' }}>{tr(`cat.${c.key}` as never)}</Text>
                  </View>
                </ArtSlot>
              ) : null}
              {active ? (
                <View style={{ position: 'absolute', top: spacing.sm, right: spacing.sm, width: 28, height: 28, borderRadius: 14, backgroundColor: t.gold, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="checkmark" size={18} color={t.onGold} />
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <SectionHeader
        title={cat === 'all' ? tr('pray.library') : tr(`cat.${cat}` as never)}
        right={
          cat !== 'all' ? (
            <Pressable onPress={() => setCat('all')} accessibilityRole="button"
              accessibilityLabel={tr('a11y.showAll')}
              style={({ pressed }) => ({
                minHeight: TAP_MIN,
                paddingHorizontal: spacing.md,
                borderRadius: radius.pill,
                justifyContent: 'center',
                backgroundColor: pressed ? t.surfaceAlt : 'transparent',
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <Text style={{ ...type.calloutMedium, color: t.blue }}>{tr('pray.showAll')}</Text>
            </Pressable>
          ) : undefined
        }
      />
      <View style={{ gap: spacing.md }}>
        {list.map((p) => {
          const locked = p.plus && !isPlus;
          return (
            <Pressable
              key={p.id}
              onPress={() => open(p)}
              accessibilityRole="button"
              accessibilityLabel={locked
                ? `${tf('a11y.requiresPlus', { title: p.title })}, ${p.minutes} ${tr('pray.min')}`
                : `${p.title}, ${p.minutes} ${tr('pray.min')}`}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.lg,
                backgroundColor: t.surface,
                borderRadius: radius.card,
                borderWidth: 1,
                borderColor: t.border,
                padding: spacing.lg,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: t.surfaceAlt,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons
                  name={locked ? 'lock-closed-outline' : 'play'}
                  size={20}
                  color={locked ? t.inkFaint : t.gold}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ ...type.bodySemi, color: t.ink }}>{p.title}</Text>
                <Text style={{ ...type.label, color: t.inkSoft, marginTop: 2 }}>
                  {p.minutes} {tr('pray.min')} · {tr(`cat.${p.category}` as never)}
                </Text>
              </View>
              {p.plus ? (
                <View
                  style={{
                    backgroundColor: locked ? t.surfaceAlt : t.goldSoft,
                    borderRadius: radius.pill,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: 3,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  {locked ? <Ionicons name="lock-closed-outline" size={12} color={t.goldText} /> : null}
                  <Text style={{ ...type.overlineBold, color: locked ? t.goldText : t.gold }}>
                    PLUS
                  </Text>
                  </View>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}
