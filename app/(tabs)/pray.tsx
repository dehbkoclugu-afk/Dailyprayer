import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { useTheme } from '@/hooks/useTheme';
import { fonts, type as ty } from '@/theme/typography';
import { radius, spacing, TAP_MIN } from '@/theme/tokens';
import { usePrayers, prayerCategories, type GuidedPrayer } from '@/data/prayers';
import { useEntitlementStore } from '@/state/useEntitlementStore';
import { useT } from '@/i18n';

export default function Pray() {
  const t = useTheme();
  const { t: tr } = useT();
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
      <Text style={[ty.secondary, { color: t.inkSoft, marginTop: spacing.xs }]}>
{tr('pray.sub')}
      </Text>

      {/* category filter — a single calm chip row (matches the Bible chapter
          picker); tap the active chip again to clear back to the full library */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: spacing.lg, marginHorizontal: -spacing.xl }}
        contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.xl }}
      >
        {prayerCategories.map((c) => {
          const active = cat === c.key;
          return (
            <Pressable
              key={c.key}
              onPress={() => setCat(active ? 'all' : c.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={tr(`cat.${c.key}` as never)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: active ? t.goldSoft : t.surface,
                borderColor: active ? t.gold : t.border,
                borderWidth: 1,
                borderRadius: radius.pill,
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.sm,
                minHeight: TAP_MIN,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Ionicons
                name={c.icon as keyof typeof Ionicons.glyphMap}
                size={16}
                color={active ? t.gold : t.inkSoft}
              />
              <Text
                style={{
                  fontFamily: active ? fonts.sansSemiBold : fonts.sansMedium,
                  fontSize: 14,
                  color: active ? t.gold : t.inkSoft,
                }}
              >
                {tr(`cat.${c.key}` as never)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <SectionHeader
        title={cat === 'all' ? tr('pray.library') : tr(`cat.${cat}` as never)}
        right={
          cat !== 'all' ? (
            <Pressable onPress={() => setCat('all')} accessibilityRole="button"
              accessibilityLabel={tr('a11y.showAll')}
              style={{ minHeight: TAP_MIN, justifyContent: 'center' }}
            >
              <Text style={{ fontFamily: fonts.sansMedium, fontSize: 14, color: t.blue }}>{tr('pray.showAll')}</Text>
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
              accessibilityLabel={`${p.title}, ${p.minutes} ${tr('pray.min')}${p.plus ? ' · Plus' : ''}`}
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
                <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 16, color: t.ink }}>{p.title}</Text>
                <Text style={{ fontFamily: fonts.sans, fontSize: 13, color: t.inkSoft, marginTop: 2 }}>
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
                  {/* 11sp is Material's label-small floor; this badge sat below
                      it at 10sp (roadmap item 32). Its gold-on-goldSoft colour
                      pair has its own contrast problem in the Dawn theme —
                      documented, not fixed here; see the item's plan doc. */}
                  <Text style={{ fontFamily: fonts.sansBold, fontSize: 11, color: locked ? t.inkFaint : t.gold }}>
                    PLUS
                  </Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}
