import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { ArtSlot } from '@/components/ArtSlot';
import { useTheme } from '@/hooks/useTheme';
import { useArtwork } from '@/hooks/useArtwork';
import { fonts, type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { usePrayers, prayerCategories, type GuidedPrayer } from '@/data/prayers';
import { useEntitlementStore } from '@/state/useEntitlementStore';
import { useT } from '@/i18n';
import { prayerArt } from '@/assets/registry';

export default function Pray() {
  const t = useTheme();
  const artwork = useArtwork();
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

      {/* category filter , a single calm chip row (matches the Bible chapter
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
                gap: spacing.sm,
                backgroundColor: active ? t.goldSoft : t.surface,
                borderColor: active ? t.gold : t.border,
                borderWidth: 1,
                borderRadius: radius.pill,
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.sm,
                minHeight: 48,
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
            <Pressable onPress={() => setCat('all')} hitSlop={8} accessibilityRole="button" accessibilityLabel={tr('a11y.showAll')}>
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
                backgroundColor: t.surface,
                borderRadius: radius.card,
                borderWidth: 1,
                borderColor: t.border,
                overflow: 'hidden',
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <ArtSlot
                id={prayerArt(p.id)}
                variant="row"
                radius={radius.card}
                style={{ width: '100%' }}
              >
                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: spacing.xl,
                    paddingVertical: spacing.xl,
                    minHeight: 176,
                  }}
                >
                  <View
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 23,
                      backgroundColor: 'rgba(14,18,32,0.36)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: spacing.md,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.24)',
                    }}
                  >
                    <Ionicons
                      name={locked ? 'lock-closed-outline' : 'play'}
                      size={20}
                      color={locked ? artwork.foreground.tertiary : '#FFFFFF'}
                    />
                  </View>
                  <View style={{ alignItems: 'center', maxWidth: 280 }}>
                    <Text
                      numberOfLines={2}
                      style={{
                        fontFamily: fonts.serif,
                        fontSize: 21,
                        lineHeight: 26,
                        color: '#FFFFFF',
                        textAlign: 'center',
                        textShadowColor: 'rgba(0,0,0,0.78)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 8,
                      }}
                    >
                      {p.title}
                    </Text>
                    <Text
                      style={{
                        fontFamily: fonts.sansMedium,
                        fontSize: 13,
                        color: 'rgba(255,255,255,0.90)',
                        marginTop: spacing.xs,
                        textAlign: 'center',
                        textShadowColor: 'rgba(0,0,0,0.78)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 6,
                      }}
                    >
                      {p.minutes} {tr('pray.min')} · {tr(`cat.${p.category}` as never)}
                    </Text>
                  </View>
                  {p.plus ? (
                    <View
                      style={{
                        position: 'absolute',
                        right: spacing.md,
                        top: 14,
                        backgroundColor: 'rgba(14,18,32,0.50)',
                        borderRadius: radius.pill,
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.22)',
                        paddingHorizontal: spacing.sm,
                        paddingVertical: 3,
                      }}
                    >
                      <Text style={{ fontFamily: fonts.sansBold, fontSize: 10, color: locked ? artwork.foreground.tertiary : '#FFFFFF' }}>
                        PLUS
                      </Text>
                    </View>
                  ) : null}
                </View>
              </ArtSlot>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}
