import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { useTheme } from '@/hooks/useTheme';
import { fonts, type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { prayers, prayerCategories, type GuidedPrayer } from '@/data/prayers';
import { useEntitlementStore } from '@/state/useEntitlementStore';
import { ArtSlot } from '@/components/ArtSlot';
import { categoryArt } from '@/assets/registry';
import { useT } from '@/i18n';
import { usePrayerStore } from '@/state/usePrayerStore';

export default function Pray() {
  const t = useTheme();
  const { t: tr } = useT();
  const isPlus = useEntitlementStore((s) => s.isPlus);
  const [cat, setCat] = useState<GuidedPrayer['category'] | 'all'>('all');
  const list = cat === 'all' ? prayers : prayers.filter((p) => p.category === cat);
  const recentPrayerId = usePrayerStore((s) => s.recentPrayerId);
  const favoritePrayerIds = usePrayerStore((s) => s.favoritePrayerIds);
  const markOpened = usePrayerStore((s) => s.markOpened);
  const toggleFavorite = usePrayerStore((s) => s.toggleFavorite);
  const recommended =
    prayers.find((prayer) => prayer.id === recentPrayerId) ??
    prayers.find((prayer) => !prayer.plus) ??
    prayers[0];

  const open = (p: GuidedPrayer) => {
    if (p.plus && !isPlus) router.push('/paywall');
    else {
      markOpened(p.id);
      router.push({ pathname: '/player', params: { id: p.id } });
    }
  };

  return (
    <Screen tabbed>
      <Text style={[ty.title, { color: t.ink }]}>{tr('pray.title')}</Text>
      <Text style={[ty.secondary, { color: t.inkSoft, marginTop: spacing.xs }]}>
{tr('pray.sub')}
      </Text>

      <Pressable
        onPress={() => open(recommended)}
        accessibilityRole="button"
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.lg,
          backgroundColor: t.goldSoft,
          borderColor: t.gold,
          borderWidth: 1,
          borderRadius: radius.card,
          padding: spacing.lg,
          marginTop: spacing.lg,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <ArtSlot
          id={categoryArt(recommended.category)!}
          height={72}
          fit="cover"
          style={{ width: 72, borderRadius: 36, overflow: 'hidden' }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 13, color: t.gold }}>
            {recentPrayerId ? tr('pray.continue') : tr('pray.recommended')}
          </Text>
          <Text style={{ fontFamily: fonts.serif, fontSize: 20, color: t.ink, marginTop: 2 }}>
            {recommended.title}
          </Text>
        </View>
        <Ionicons name="play" size={22} color={t.gold} />
      </Pressable>

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
              accessibilityLabel={c.label}
              style={({ pressed }) => ({
                minHeight: 48,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                paddingHorizontal: spacing.md,
                backgroundColor: active ? t.goldSoft : t.surface,
                borderColor: active ? t.gold : t.border,
                borderWidth: 1,
                borderRadius: radius.inner,
                opacity: pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  overflow: 'hidden',
                  backgroundColor: active ? 'transparent' : t.surfaceAlt,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {categoryArt(c.key) ? (
                  <ArtSlot id={categoryArt(c.key)!} height={28} fit="cover" style={{ width: 28 }} />
                ) : (
                  <Ionicons name={c.icon as never} size={22} color={t.gold} />
                )}
              </View>
              <Text
                style={{
                  fontFamily: active ? fonts.sansSemiBold : fonts.sansMedium,
                  fontSize: 13,
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
              accessibilityLabel={tr('pray.showAll')}
              style={{ minHeight: 48, justifyContent: 'center' }}
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
              accessibilityLabel={`${p.title}, ${p.minutes} minutes${locked ? ', requires Plus' : ''}`}
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
              <Pressable
                onPress={(event) => {
                  event.stopPropagation();
                  toggleFavorite(p.id);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: favoritePrayerIds.includes(p.id) }}
                accessibilityLabel={
                  favoritePrayerIds.includes(p.id) ? tr('pray.unfavorite') : tr('pray.favorite')
                }
                style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons
                  name={favoritePrayerIds.includes(p.id) ? 'heart' : 'heart-outline'}
                  size={20}
                  color={favoritePrayerIds.includes(p.id) ? t.gold : t.inkSoft}
                />
              </Pressable>
              {p.plus ? (
                <View
                  style={{
                    backgroundColor: locked ? t.surfaceAlt : t.goldSoft,
                    borderRadius: radius.pill,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: 3,
                  }}
                >
                  <Text style={{ fontFamily: fonts.sansBold, fontSize: 10, color: locked ? t.inkFaint : t.gold }}>
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
