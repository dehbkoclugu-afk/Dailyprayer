import React from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { ArtSlot } from '@/components/ArtSlot';
import { useTheme } from '@/hooks/useTheme';
import { type, type as ty } from '@/theme/typography';
import { radius, spacing, TAP_MIN } from '@/theme/tokens';
import { useStackedLayout } from '@/theme/textScale';
import { usePlans } from '@/data/plans';
import { bookMeta, bookName } from '@/data/bibleMeta';
import { getBible, getBibleCredit } from '@/data/bibleFull';
import { useEntitlementStore } from '@/state/useEntitlementStore';
import { useReaderStore } from '@/state/useReaderStore';
import { useT } from '@/i18n';

export default function Bible() {
  const t = useTheme();
  const stacked = useStackedLayout();
  const { t: tr, tn, locale, tu, tf } = useT();
  const isPlus = useEntitlementStore((s) => s.isPlus);
  const plans = usePlans();
  const { width } = useWindowDimensions();
  const expanded = width >= 840;
  const { book, chapter, verse } = useReaderStore();
  const readerVerse = Number.isInteger(verse) && verse >= 0 ? verse : 0;
  const readerBook = bookMeta[book] ?? bookMeta[0];
  const readerBookName = bookName(locale, readerBook.code);
  const readerChapter = chapter;
  const chapterLength = getBible(locale)[book]?.chapters[chapter]?.length ?? 1;
  const readerProgress = Math.min(100, Math.round(((readerVerse + 1) / chapterLength) * 100));

  return (
    <Screen tabbed>
      <Text style={[ty.title, { color: t.ink }]}>{tr('bible.title')}</Text>

      {/* The Scripture reader — the tab's flagship, so it earns a full art hero
          at least as grand as the plan covers below. Resumes the last position. */}
      <Pressable
        onPress={() => router.push('/read')}
        accessibilityRole="button"
        accessibilityLabel={`${tr('read.openBible')} — ${tr('read.continue')} ${readerBookName} ${readerChapter + 1}:${readerVerse + 1}, ${readerProgress}%`}
        style={({ pressed }) => ({ marginTop: spacing.xl, opacity: pressed ? 0.92 : 1 })}
      >
        <View style={{ borderRadius: radius.card, overflow: 'hidden' }}>
          <ArtSlot id="A18-ritual-reading" height={176} radius={radius.card}>
            {/* keep the candlelit art bright — only enough darkening at the base
                for the cream title to stay legible */}
            <LinearGradient
              colors={['rgba(26,18,6,0.02)', 'rgba(26,18,6,0.26)', 'rgba(20,14,6,0.78)']}
              start={{ x: 0.3, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={{ position: 'absolute', width: '100%', height: '100%' }}
            />
            <View style={{ flex: 1, padding: spacing.xl, justifyContent: 'flex-end' }}>
              <Text
                style={{ ...type.overline, letterSpacing: 2.5,
                  color: 'rgba(217,164,65,0.9)' }}
              >
                {tu(tr('read.continue'))}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 4 }}>
                <View style={{ flex: 1, paddingRight: spacing.lg }}>
                  <Text style={{ ...type.subtitle, color: '#F2EEE6' }}>
                    {tr('read.openBible')}
                  </Text>
                  <Text style={{ ...type.calloutMedium, color: 'rgba(242,238,230,0.82)', marginTop: spacing.xs }}>
                    {readerBookName} {readerChapter + 1}:{readerVerse + 1} · {readerProgress}%
                  </Text>
                </View>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: '#D9A441',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="arrow-forward" size={22} color="#1A1206" />
                </View>
              </View>
            </View>
          </ArtSlot>
        </View>
      </Pressable>

      {/* quick access to Scripture search and the reader's saved verses */}
      <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.md }}>
        {[
          { icon: 'search' as const, label: tr('read.search'), onPress: () => router.push('/search') },
          { icon: 'bookmark-outline' as const, label: tr('library.title'), onPress: () => router.push('/library') },
        ].map((a) => (
          <Pressable
            key={a.label}
            onPress={a.onPress}
            accessibilityRole="button"
            accessibilityLabel={a.label}
            style={({ pressed }) => ({
              flex: 1,
              // Icon beside label normally; above it once the text is large
              // (roadmap item 30), which gives the label the button's full width
              // instead of the half it keeps after the icon and gap take theirs.
              flexDirection: stacked ? 'column' : 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.sm,
              backgroundColor: t.surface,
              borderRadius: radius.inner,
              borderWidth: 1,
              borderColor: t.border,
              paddingVertical: spacing.md,
              minHeight: TAP_MIN,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Ionicons name={a.icon} size={18} color={t.gold} />
            <Text style={{ ...type.calloutSemi, color: t.ink }}>{a.label}</Text>
          </Pressable>
        ))}
      </View>

      <SectionHeader title={tr('bible.plans')} />
      <View style={{ gap: spacing.md, flexDirection: expanded ? 'row' : 'column', flexWrap: expanded ? 'wrap' : 'nowrap' }}>
        {plans.map((p) => {
          const locked = p.plus && !isPlus;
          return (
            <Pressable
              key={p.id}
              onPress={() =>
                locked
                  ? router.push('/paywall?from=plan')
                  : router.push({ pathname: '/plan/[id]', params: { id: p.id } })
              }
              accessibilityRole="button"
              accessibilityLabel={locked ? tf('a11y.requiresPlus', { title: p.title }) : p.title}
              style={{ width: expanded ? '48.8%' : '100%' }}
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
                      <Text style={{ ...type.heading, color: '#F2EEE6', flex: 1 }}>
                        {p.title}
                      </Text>
                      {locked ? <Ionicons name="lock-closed" size={18} color="#D9A441" /> : null}
                    </View>
                    <Text style={{ ...type.callout, color: 'rgba(242,238,230,0.75)', marginTop: spacing.xs }}>
                      {p.tagline}
                    </Text>
                    <Text
                      style={{ ...type.labelMedium, color: '#D9A441',
                        marginTop: spacing.sm,
                        fontVariant: ['tabular-nums'] }}
                    >
{p.days} {tn(p.days, 'bible.days')}
                    </Text>
                  </View>
                </ArtSlot>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Scripture attribution — each translation carries its own license credit.
          Tapping it opens the full edition, license and attribution, so the credit
          is an entry point rather than the whole disclosure (roadmap item 12). */}
      <Pressable
        onPress={() => router.push('/source')}
        accessibilityRole="button"
        accessibilityLabel={`${getBibleCredit(locale)} — ${tr('read.textSource')}`}
        style={({ pressed }) => ({
          marginTop: spacing.xl,
          minHeight: TAP_MIN,
          justifyContent: 'center',
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <Text
          style={{ ...type.label, lineHeight: 18,
            color: t.inkFaint,
            textAlign: 'center' }}
        >
          {getBibleCredit(locale)}
        </Text>
        <Text
          style={{ ...type.labelMedium, color: t.goldText,
            textAlign: 'center',
            marginTop: 2 }}
        >
          {tr('read.textSource')}
        </Text>
      </Pressable>
    </Screen>
  );
}
