import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { ArtSlot } from '@/components/ArtSlot';
import { useTheme } from '@/hooks/useTheme';
import { fonts, type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { sampleChapters } from '@/data/bible';
import { plans } from '@/data/plans';
import { useEntitlementStore } from '@/state/useEntitlementStore';
import { useHighlightStore } from '@/state/useHighlightStore';
import { toast } from '@/state/useToastStore';
import { useT, translate } from '@/i18n';

export default function Bible() {
  const t = useTheme();
  const { t: tr } = useT();
  const isPlus = useEntitlementStore((s) => s.isPlus);
  const { keys: highlightKeys, toggle: toggleHighlight } = useHighlightStore();
  const [openIdx, setOpenIdx] = useState(0);
  const chapter = sampleChapters[openIdx];

  return (
    <Screen tabbed>
      <Text style={[ty.title, { color: t.ink }]}>{tr('bible.title')}</Text>
      <Text style={[ty.secondary, { color: t.inkSoft, marginTop: spacing.xs }]}>
{tr('bible.sub')}
      </Text>

      {/* chapter picker — single horizontal row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: spacing.lg, marginHorizontal: -spacing.xl }}
        contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.xl }}
      >
        {sampleChapters.map((c, i) => {
          const active = i === openIdx;
          return (
            <Pressable
              key={`${c.book}-${c.chapter}`}
              onPress={() => setOpenIdx(i)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={{
                backgroundColor: active ? t.goldSoft : 'transparent',
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
      </ScrollView>

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
        <Text style={{ fontFamily: fonts.sans, fontSize: 12, color: t.inkFaint, marginBottom: spacing.md }}>
          {tr('bible.highlightHint')}
        </Text>
        {chapter.verses.map((v, i) => {
          const hKey = `${chapter.book}|${chapter.chapter}|${i}`;
          const highlighted = highlightKeys.includes(hKey);
          return (
          <Text
            key={i}
            onPress={() => {
              const on = toggleHighlight(hKey);
              toast(translate(on ? 'toast.highlightOn' : 'toast.highlightOff'));
            }}
            suppressHighlighting
            style={{
              fontFamily: fonts.serifLight,
              fontSize: 19,
              lineHeight: 34,
              color: t.ink,
              marginBottom: spacing.md,
              backgroundColor: highlighted ? t.goldSoft : 'transparent',
            }}
          >
            <Text
              style={{
                fontFamily: fonts.sansBold,
                fontSize: 11,
                color: t.gold,
                fontVariant: ['tabular-nums'],
              }}
            >
              {i + 1}{'  '}
            </Text>
            {v}
          </Text>
          );
        })}
      </View>

      <SectionHeader title={tr('bible.plans')} />
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
              <View style={{ borderRadius: radius.card, overflow: 'hidden' }}>
                <ArtSlot id="A13-plan-cover" height={150} radius={radius.card}>
                  <LinearGradient
                    colors={[`${p.gradient[0]}CC`, `${p.gradient[1]}F2`]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ position: 'absolute', width: '100%', height: '100%' }}
                  />
                  <View style={{ flex: 1, padding: spacing.xl, justifyContent: 'flex-end' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontFamily: fonts.serif, fontSize: 20, color: '#F2EEE6', flex: 1 }}>
                        {p.title}
                      </Text>
                      {locked ? <Ionicons name="lock-closed" size={18} color="#D9A441" /> : null}
                    </View>
                    <Text style={{ fontFamily: fonts.sans, fontSize: 14, color: 'rgba(242,238,230,0.75)', marginTop: spacing.xs }}>
                      {p.tagline}
                    </Text>
                    <Text
                      style={{
                        fontFamily: fonts.sansMedium,
                        fontSize: 12,
                        color: '#D9A441',
                        marginTop: spacing.sm,
                        fontVariant: ['tabular-nums'],
                      }}
                    >
{p.days} {tr('bible.days')}
                    </Text>
                  </View>
                </ArtSlot>
              </View>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}
