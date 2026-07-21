import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { useTheme } from '@/hooks/useTheme';
import { fonts, type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { sampleChapters } from '@/data/bible';
import { plans } from '@/data/plans';
import { useEntitlementStore } from '@/state/useEntitlementStore';

export default function Bible() {
  const t = useTheme();
  const isPlus = useEntitlementStore((s) => s.isPlus);
  const [openIdx, setOpenIdx] = useState(0);
  const chapter = sampleChapters[openIdx];

  return (
    <Screen tabbed>
      <Text style={[ty.title, { color: t.ink }]}>Bible</Text>
      <Text style={[ty.secondary, { color: t.inkSoft, marginTop: spacing.xs }]}>
        World English Bible · offline
      </Text>

      {/* chapter picker */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg, flexWrap: 'wrap' }}>
        {sampleChapters.map((c, i) => {
          const active = i === openIdx;
          return (
            <Pressable
              key={`${c.book}-${c.chapter}`}
              onPress={() => setOpenIdx(i)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={{
                backgroundColor: active ? t.goldSoft : t.surface,
                borderColor: active ? t.gold : t.border,
                borderWidth: 1,
                borderRadius: radius.pill,
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.sm,
                minHeight: 44,
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontFamily: fonts.sansMedium, fontSize: 14, color: active ? t.gold : t.inkSoft }}>
                {c.book} {c.chapter}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* reader */}
      <View
        style={{
          backgroundColor: t.surface,
          borderRadius: radius.card,
          borderWidth: 1,
          borderColor: t.border,
          padding: spacing.xl,
          marginTop: spacing.lg,
        }}
      >
        <Text style={[ty.title, { color: t.ink, marginBottom: spacing.lg }]}>
          {chapter.book} {chapter.chapter}
        </Text>
        {chapter.verses.map((v, i) => (
          <Text
            key={i}
            style={{
              fontFamily: fonts.serifLight,
              fontSize: 18,
              lineHeight: 30,
              color: t.ink,
              marginBottom: spacing.md,
            }}
          >
            <Text style={{ fontFamily: fonts.sansBold, fontSize: 12, color: t.gold }}>{i + 1}  </Text>
            {v}
          </Text>
        ))}
      </View>

      <SectionHeader title="Reading plans" />
      <View style={{ gap: spacing.md }}>
        {plans.map((p) => {
          const locked = p.plus && !isPlus;
          return (
            <Pressable
              key={p.id}
              onPress={() => (locked ? router.push('/paywall') : null)}
              accessibilityRole="button"
              accessibilityLabel={`${p.title}${locked ? ', requires Plus' : ''}`}
            >
              <LinearGradient
                colors={p.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: radius.card, padding: spacing.xl }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontFamily: fonts.serif, fontSize: 20, color: '#F2EEE6', flex: 1 }}>
                    {p.title}
                  </Text>
                  {locked ? <Ionicons name="lock-closed" size={18} color="#D9A441" /> : null}
                </View>
                <Text style={{ fontFamily: fonts.sans, fontSize: 14, color: 'rgba(242,238,230,0.75)', marginTop: spacing.xs }}>
                  {p.tagline}
                </Text>
                <Text style={{ fontFamily: fonts.sansMedium, fontSize: 12, color: '#D9A441', marginTop: spacing.md }}>
                  {p.days} days
                </Text>
              </LinearGradient>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}
