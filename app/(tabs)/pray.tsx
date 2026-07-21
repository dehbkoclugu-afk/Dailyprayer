import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { ArtSlot } from '@/components/ArtSlot';
import type { AssetId } from '@/assets/registry';
import { useTheme } from '@/hooks/useTheme';
import { fonts, type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { prayers, prayerCategories, type GuidedPrayer } from '@/data/prayers';
import { useEntitlementStore } from '@/state/useEntitlementStore';
import { useT } from '@/i18n';

export default function Pray() {
  const t = useTheme();
  const { t: tr } = useT();
  const isPlus = useEntitlementStore((s) => s.isPlus);
  const [cat, setCat] = useState<GuidedPrayer['category'] | 'all'>('all');
  const list = cat === 'all' ? prayers : prayers.filter((p) => p.category === cat);

  const open = (p: GuidedPrayer) => {
    if (p.plus && !isPlus) router.push('/paywall');
    else router.push({ pathname: '/player', params: { id: p.id } });
  };

  return (
    <Screen tabbed>
      <Text style={[ty.title, { color: t.ink }]}>{tr('pray.title')}</Text>
      <Text style={[ty.secondary, { color: t.inkSoft, marginTop: spacing.xs }]}>
{tr('pray.sub')}
      </Text>

      {/* category tile grid — tap again to clear; tiles take A11 art when it lands */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.lg }}>
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
                width: '30.5%',
                flexGrow: 1,
                aspectRatio: 1.05,
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.sm,
                backgroundColor: active ? t.goldSoft : t.surface,
                borderColor: active ? t.gold : t.border,
                borderWidth: 1,
                borderRadius: radius.inner,
                opacity: pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              <ArtSlot
                id={`A11-${c.key}` as AssetId}
                height={68}
                fit="contain"
                style={{ width: 68 }}
              />
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
      </View>

      <SectionHeader
        title={cat === 'all' ? tr('pray.library') : tr(`cat.${cat}` as never)}
        right={
          cat !== 'all' ? (
            <Pressable onPress={() => setCat('all')} hitSlop={8} accessibilityRole="button" accessibilityLabel="Show all prayers">
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
