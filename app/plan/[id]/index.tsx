import React from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArtSlot } from '@/components/ArtSlot';
import { PlanDayArtwork } from '@/components/PlanDayArtwork';
import { useTheme } from '@/hooks/useTheme';
import { useArtwork } from '@/hooks/useArtwork';
import { fonts } from '@/theme/typography';
import { radius, spacing, art, FIXED_CARD_TEXT_SCALE } from '@/theme/tokens';
import { usePlans } from '@/data/plans';
import { planReading, formatReadingRef } from '@/data/planReadings';
import { usePlanStore } from '@/state/usePlanStore';
import { useT } from '@/i18n';
import { getDirectionalIconName } from '@/i18n/direction';
import { useRequirePlus } from '@/hooks/useRequirePlus';
import { BackButton } from '@/components/BackButton';

export default function PlanScreen() {
  const t = useTheme();
  const artwork = useArtwork();
  const dawn = artwork.scheme === 'dawn';
  const { t: tr, locale } = useT();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const plan = usePlans().find((p) => p.id === id);
  const progress = usePlanStore((s) => s.progress);
  const allowed = useRequirePlus(Boolean(plan?.plus), 'plan');

  if (!plan || !allowed) return <View style={{ flex: 1, backgroundColor: t.bg }} />;

  const done = progress[plan.id] ?? [];
  const days = Array.from({ length: plan.days }, (_, i) => i);

  const header = (
    <View>
      <BackButton style={{ marginBottom: spacing.lg }} />

      <View style={{ borderRadius: radius.card, overflow: 'hidden' }}>
        <ArtSlot id={plan.art} height={170} radius={radius.card} variant={dawn ? 'card' : 'bare'}>
          {!dawn ? (
            <LinearGradient
              colors={[`${plan.gradient[0]}CC`, `${plan.gradient[1]}F2`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ position: 'absolute', width: '100%', height: '100%' }}
            />
          ) : null}
          <View style={{ flex: 1, padding: spacing.xl, justifyContent: 'flex-end' }}>
            <Text maxFontSizeMultiplier={FIXED_CARD_TEXT_SCALE} style={{ fontFamily: fonts.serif, fontSize: 24, color: art.ink, textShadowColor: art.textShadow, textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 7 }}>{plan.title}</Text>
            <Text maxFontSizeMultiplier={FIXED_CARD_TEXT_SCALE} style={{ fontFamily: fonts.sans, fontSize: 14, color: art.inkSoft, marginTop: spacing.xs, textShadowColor: art.textShadow, textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 }}>
              {plan.tagline}
            </Text>
          </View>
        </ArtSlot>
      </View>

      <View style={{ marginTop: spacing.lg, marginBottom: spacing.md }}>
        <View style={{ height: 6, backgroundColor: t.surfaceAlt, borderRadius: 3, overflow: 'hidden' }}>
          <View
            style={{
              width: `${(done.length / plan.days) * 100}%`,
              height: '100%',
              backgroundColor: t.gold,
              borderRadius: 3,
            }}
          />
        </View>
        <Text maxFontSizeMultiplier={FIXED_CARD_TEXT_SCALE}
          style={{
            fontFamily: fonts.sansMedium,
            fontSize: 13,
            color: t.inkSoft,
            marginTop: spacing.sm,
            fontVariant: ['tabular-nums'],
          }}
        >
          {done.length} / {plan.days} {tr('bible.days')}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <FlatList
        data={days}
        keyExtractor={(d) => String(d)}
        ListHeaderComponent={header}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.xl,
          paddingHorizontal: spacing.xl,
          paddingBottom: insets.bottom + spacing.xxl,
          maxWidth: 480,
          width: '100%',
          alignSelf: 'center',
        }}
        renderItem={({ item: dayIdx }) => {
          const readingRef = formatReadingRef(planReading(plan.id, dayIdx), locale);
          const isDone = done.includes(dayIdx);
          return (
            <Pressable
              onPress={() => router.push({ pathname: '/plan/[id]/[day]', params: { id: plan.id, day: dayIdx } })}
              accessibilityRole="button"
              accessibilityLabel={`${tr('plan.dayLabel')} ${dayIdx + 1}, ${readingRef}${isDone ? `, ${tr('plan.done')}` : ''}`}
              style={({ pressed }) => ({
                backgroundColor: t.surface,
                borderRadius: radius.card,
                borderWidth: 1,
                borderColor: isDone ? t.gold : t.border,
                overflow: 'hidden',
                marginBottom: spacing.md,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <PlanDayArtwork planId={plan.id} dayIndex={dayIdx} radius={radius.card} style={{ width: '100%' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingLeft: spacing.lg, paddingVertical: spacing.lg, paddingRight: spacing.lg, minHeight: 80 }}>
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      backgroundColor: isDone ? t.gold : artwork.foreground.badge,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isDone ? (
                      <Ionicons name="checkmark" size={18} color={t.onGold} />
                    ) : (
                      <Text maxFontSizeMultiplier={FIXED_CARD_TEXT_SCALE} style={{ fontFamily: fonts.sansBold, fontSize: 13, color: artwork.foreground.secondary, fontVariant: ['tabular-nums'], textShadowColor: 'rgba(0,0,0,0.72)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 5 }}>
                        {dayIdx + 1}
                      </Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text maxFontSizeMultiplier={FIXED_CARD_TEXT_SCALE} style={{ fontFamily: fonts.sansSemiBold, fontSize: 15, color: artwork.foreground.primary, textShadowColor: art.textShadow, textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 }}>
                      {tr('plan.dayLabel')} {dayIdx + 1}
                    </Text>
                    <Text maxFontSizeMultiplier={FIXED_CARD_TEXT_SCALE} style={{ fontFamily: fonts.sansMedium, fontSize: 13, color: isDone ? t.gold : artwork.foreground.secondary, marginTop: 2, textShadowColor: 'rgba(0,0,0,0.72)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 5 }}>
                      {readingRef}
                    </Text>
                  </View>
                  <Ionicons name={getDirectionalIconName('chevron-forward', locale)} size={18} color={artwork.foreground.tertiary} />
                </View>
              </PlanDayArtwork>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
