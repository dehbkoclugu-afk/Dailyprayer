import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { ArtSlot } from '@/components/ArtSlot';
import { useTheme } from '@/hooks/useTheme';
import { fonts, type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { usePlans } from '@/data/plans';
import { bookMeta } from '@/data/bibleMeta';
import { useEntitlementStore } from '@/state/useEntitlementStore';
import { useReaderStore } from '@/state/useReaderStore';
import { useT } from '@/i18n';

export default function Bible() {
  const t = useTheme();
  const { t: tr } = useT();
  const isPlus = useEntitlementStore((s) => s.isPlus);
  const plans = usePlans();
  const { book, chapter } = useReaderStore();
  const readerBook = bookMeta[book] ?? bookMeta[0];
  const readerChapter = chapter;

  return (
    <Screen tabbed>
      <Text style={[ty.title, { color: t.ink }]}>{tr('bible.title')}</Text>
      <Text style={[ty.secondary, { color: t.inkSoft, marginTop: spacing.xs }]}>
{tr('bible.sub')}
      </Text>

      {/* A14 — restrained line-art etching under the header */}
      <ArtSlot
        id="A14-bible-etching"
        height={64}
        fit="contain"
        style={{ marginTop: spacing.md, opacity: 0.55 }}
      />

      {/* Open the full sequential Bible reader (resumes the last position) */}
      <Pressable
        onPress={() => router.push('/read')}
        accessibilityRole="button"
        accessibilityLabel={tr('read.openBible')}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.lg,
          backgroundColor: t.surface,
          borderRadius: radius.card,
          borderWidth: 1,
          borderColor: t.border,
          padding: spacing.lg,
          marginTop: spacing.lg,
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: radius.inner,
            backgroundColor: t.goldSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="book" size={22} color={t.gold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 16, color: t.ink }}>
            {tr('read.openBible')}
          </Text>
          <Text style={{ fontFamily: fonts.sans, fontSize: 13, color: t.inkSoft, marginTop: 2 }}>
            {tr('read.continue')} · {readerBook.name} {readerChapter + 1}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={t.inkFaint} />
      </Pressable>

      <SectionHeader title={tr('bible.plans')} />
      <View style={{ gap: spacing.md }}>
        {plans.map((p) => {
          const locked = p.plus && !isPlus;
          return (
            <Pressable
              key={p.id}
              onPress={() =>
                locked
                  ? router.push('/paywall')
                  : router.push({ pathname: '/plan/[id]', params: { id: p.id } })
              }
              accessibilityRole="button"
              accessibilityLabel={`${p.title}${locked ? ', requires Plus' : ''}`}
            >
              <View style={{ borderRadius: radius.card, overflow: 'hidden' }}>
                <ArtSlot id={p.art} height={150} radius={radius.card}>
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

      {/* Scripture attribution — required by the YTC CC-BY-ND license. */}
      <Text
        style={{
          fontFamily: fonts.sans,
          fontSize: 11,
          color: t.inkFaint,
          textAlign: 'center',
          marginTop: spacing.xl,
        }}
      >
        {tr('bible.credit')}
      </Text>
    </Screen>
  );
}
