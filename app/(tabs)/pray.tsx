import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { ArtSlot } from '@/components/ArtSlot';
import { useTheme } from '@/hooks/useTheme';
import { useArtwork } from '@/hooks/useArtwork';
import { type as ty } from '@/theme/typography';
import { interaction, radius, spacing } from '@/theme/tokens';
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

      {/* Six illustrated category doors make the full library discoverable at a glance. */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.lg }}>
        {prayerCategories.map((c) => {
          const active = cat === c.key;
          const categoryPrayer = prayers.find((prayer) => prayer.category === c.key)!;
          return (
            <Pressable
              key={c.key}
              onPress={() => setCat(active ? 'all' : c.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={tr(`cat.${c.key}` as never)}
              style={({ pressed }) => ({
                flexGrow: 1,
                flexBasis: '46%',
                minHeight: 112,
                backgroundColor: t.surface,
                borderColor: active ? t.gold : t.border,
                borderWidth: active ? 2 : 1,
                borderRadius: radius.inner,
                overflow: 'hidden',
                opacity: pressed ? interaction.pressedOpacity : 1,
              })}
            >
              <ArtSlot id={prayerArt(categoryPrayer.id)} scrim="strong" radius={radius.inner} style={{ minHeight: 112 }}>
                <View style={{ minHeight: 112, padding: spacing.md, justifyContent: 'flex-end' }}>
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(14,18,32,0.42)', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm }}>
                    <Ionicons name={c.icon as keyof typeof Ionicons.glyphMap} size={18} color={active ? t.sacredGold : t.onArtwork} />
                  </View>
                  <Text style={{ ...ty.label, color: t.onArtwork, textShadowColor: 'rgba(0,0,0,0.82)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 }}>
                    {tr(`cat.${c.key}` as never)}
                  </Text>
                </View>
              </ArtSlot>
            </Pressable>
          );
        })}
      </View>

      <SectionHeader
        title={cat === 'all' ? tr('pray.library') : tr(`cat.${cat}` as never)}
        right={
          cat !== 'all' ? (
            <Pressable
              onPress={() => setCat('all')}
              accessibilityRole="button"
              accessibilityLabel={tr('a11y.showAll')}
              style={({ pressed }) => ({
                minHeight: 48,
                paddingHorizontal: spacing.md,
                borderRadius: radius.inner,
                justifyContent: 'center',
                backgroundColor: pressed ? t.surfaceAlt : 'transparent',
              })}
            >
              <Text style={[ty.label, { color: t.blue }]}>{tr('pray.showAll')}</Text>
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
              accessibilityLabel={`${p.title}, ${p.minutes} ${tr('pray.min')}${locked ? `, ${tr('paywall.titlePrayer')}` : ''}`}
              style={({ pressed }) => ({
                backgroundColor: t.surface,
                borderRadius: radius.card,
                borderWidth: 1,
                borderColor: t.border,
                overflow: 'hidden',
                opacity: pressed ? interaction.pressedOpacity : 1,
              })}
            >
              <ArtSlot
                id={prayerArt(p.id)}
                scrim="readable"
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
                      color={locked ? artwork.foreground.tertiary : t.onArtwork}
                    />
                  </View>
                  <View style={{ alignItems: 'center', maxWidth: 280 }}>
                    <Text
                      numberOfLines={2}
                      style={{
                        ...ty.titleCompact,
                        color: t.onArtwork,
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
                        ...ty.caption,
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
                      accessible={false}
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
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        {locked ? <Ionicons name="lock-closed" size={11} color={artwork.foreground.tertiary} /> : null}
                        <Text style={{ ...ty.labelSmallBold, color: locked ? artwork.foreground.tertiary : t.onArtwork }}>PLUS</Text>
                      </View>
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
