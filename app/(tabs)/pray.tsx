import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useReducedMotion } from 'react-native-reanimated';
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

  // The chip row scrolls to keep the selected chip in view (roadmap item 42).
  // Selecting one near either edge — by tap, or by a category arriving
  // pre-selected — used to leave it clipped by the screen edge with no way to
  // tell it was even the active one without scrolling manually.
  const chipScrollRef = useRef<ScrollView>(null);
  const chipLayouts = useRef<Partial<Record<GuidedPrayer['category'], { x: number; width: number }>>>({});
  const viewport = useRef({ x: 0, width: 0 });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (cat === 'all') return;
    const chip = chipLayouts.current[cat];
    if (!chip) return;
    const { x: scrollX, width: viewportW } = viewport.current;
    if (viewportW === 0) return;
    let target: number | null = null;
    if (chip.x < scrollX + spacing.xl) {
      target = Math.max(0, chip.x - spacing.xl);
    } else if (chip.x + chip.width > scrollX + viewportW - spacing.xl) {
      target = chip.x + chip.width - viewportW + spacing.xl;
    }
    if (target != null) chipScrollRef.current?.scrollTo({ x: target, animated: !reduceMotion });
  }, [cat, reduceMotion]);

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
        ref={chipScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: spacing.lg, marginHorizontal: -spacing.xl }}
        contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.xl }}
        onLayout={(e) => {
          viewport.current.width = e.nativeEvent.layout.width;
        }}
        onScroll={(e) => {
          viewport.current.x = e.nativeEvent.contentOffset.x;
        }}
        scrollEventThrottle={16}
      >
        {prayerCategories.map((c) => {
          const active = cat === c.key;
          return (
            <Pressable
              key={c.key}
              onPress={() => setCat(active ? 'all' : c.key)}
              onLayout={(e) => {
                chipLayouts.current[c.key] = { x: e.nativeEvent.layout.x, width: e.nativeEvent.layout.width };
              }}
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
            <Pressable
              onPress={() => setCat('all')}
              accessibilityRole="button"
              accessibilityLabel={tr('a11y.showAll')}
              style={({ pressed }) => ({
                minHeight: TAP_MIN,
                justifyContent: 'center',
                paddingHorizontal: spacing.sm,
                marginRight: -spacing.sm,
                opacity: pressed ? 0.6 : 1,
              })}
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
              // roadmap item 34: was hardcoded English; matches the same
              // a11y.requiresPlus key bible.tsx uses for the same concept.
              accessibilityLabel={`${p.title}, ${p.minutes} ${tr('pray.min')}${p.plus ? tr('a11y.requiresPlus') : ''}`}
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
