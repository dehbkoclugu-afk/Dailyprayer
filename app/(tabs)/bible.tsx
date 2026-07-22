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
import { bookMeta, bookName } from '@/data/bibleMeta';
import { getBibleCredit } from '@/data/bibleFull';
import { useEntitlementStore } from '@/state/useEntitlementStore';
import { useReaderStore } from '@/state/useReaderStore';
import { useT } from '@/i18n';

export default function Bible() {
  const t = useTheme();
  const { t: tr, locale } = useT();
  const isPlus = useEntitlementStore((s) => s.isPlus);
  const plans = usePlans();
  const { book, chapter } = useReaderStore();
  const readerBook = bookMeta[book] ?? bookMeta[0];
  const readerBookName = bookName(locale, readerBook.code);
  const readerChapter = chapter;

  return (
    <Screen tabbed>
      <Text style={[ty.title, { color: t.ink }]}>{tr('bible.title')}</Text>

      {/* The Scripture reader — the tab's flagship, so it earns a full art hero
          at least as grand as the plan covers below. Resumes the last position. */}
      <Pressable
        onPress={() => router.push('/read')}
        accessibilityRole="button"
        accessibilityLabel={`${tr('read.openBible')} — ${tr('read.continue')} ${readerBookName} ${readerChapter + 1}`}
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
                style={{
                  fontFamily: fonts.sansSemiBold,
                  fontSize: 11,
                  letterSpacing: 2.5,
                  textTransform: 'uppercase',
                  color: 'rgba(217,164,65,0.9)',
                }}
              >
                {tr('read.continue')}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 4 }}>
                <View style={{ flex: 1, paddingRight: spacing.lg }}>
                  <Text style={{ fontFamily: fonts.serif, fontSize: 24, color: '#F2EEE6' }}>
                    {tr('read.openBible')}
                  </Text>
                  <Text style={{ fontFamily: fonts.sansMedium, fontSize: 14, color: 'rgba(242,238,230,0.82)', marginTop: spacing.xs }}>
                    {readerBookName} {readerChapter + 1}
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
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.sm,
              backgroundColor: t.surface,
              borderRadius: radius.inner,
              borderWidth: 1,
              borderColor: t.border,
              paddingVertical: spacing.md,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Ionicons name={a.icon} size={18} color={t.gold} />
            <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 14, color: t.ink }}>{a.label}</Text>
          </Pressable>
        ))}
      </View>

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

      {/* Scripture attribution — each translation carries its own license credit. */}
      <Text
        style={{
          fontFamily: fonts.sans,
          fontSize: 11,
          color: t.inkFaint,
          textAlign: 'center',
          marginTop: spacing.xl,
        }}
      >
        {getBibleCredit(locale)}
      </Text>
    </Screen>
  );
}
