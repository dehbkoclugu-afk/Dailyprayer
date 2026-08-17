import React from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { ArtSlot } from '@/components/ArtSlot';
import { useTheme } from '@/hooks/useTheme';
import { useArtwork } from '@/hooks/useArtwork';
import { type as ty } from '@/theme/typography';
import { interaction, radius, spacing } from '@/theme/tokens';
import { usePlans } from '@/data/plans';
import { getBible, getBibleCredit } from '@/data/bibleFull';
import { useEntitlementStore } from '@/state/useEntitlementStore';
import { useReaderStore } from '@/state/useReaderStore';
import { useT } from '@/i18n';
import { getDirectionalIconName } from '@/i18n/direction';
import { useScriptureLocale } from '@/i18n/scripture';
import { localeUpperCase } from '@/i18n/localeText';
import { contentMaxWidth, expandedPaneWidth, foldablePaneGap, isExpandedLayout } from '@/lib/adaptiveLayout';

export default function Bible() {
  const t = useTheme();
  const artwork = useArtwork();
  const dawn = artwork.scheme === 'dawn';
  const { t: tr, locale } = useT();
  const scriptureLocale = useScriptureLocale();
  const { width } = useWindowDimensions();
  const expanded = isExpandedLayout(width);
  const isPlus = useEntitlementStore((s) => s.isPlus);
  const plans = usePlans();
  const { book, chapter, verse } = useReaderStore();
  const bible = getBible(scriptureLocale);
  const readerBook = bible[book] ?? bible[0];
  const readerBookName = readerBook.name;
  const readerChapter = chapter;
  const readerVerse = Math.min(verse, Math.max(0, readerBook.chapters[readerChapter]?.length - 1));
  const verseCount = readerBook.chapters[readerChapter]?.length ?? 1;
  const chapterProgress = Math.round(((readerVerse + 1) / verseCount) * 100);

  return (
    <Screen tabbed>
      <Text style={[ty.title, { color: t.ink }]}>{tr('bible.title')}</Text>

      {/* The Scripture reader , the tab's flagship, so it earns a full art hero
          at least as grand as the plan covers below. Resumes the last position. */}
      <Pressable
        onPress={() => router.push('/read')}
        accessibilityRole="button"
        accessibilityLabel={`${tr('read.openBible')} , ${tr('read.continue')} ${readerBookName} ${readerChapter + 1}:${readerVerse + 1}, ${chapterProgress}%`}
        style={({ pressed }) => ({ marginTop: spacing.xl, opacity: pressed ? interaction.pressedOpacity : 1 })}
      >
        <View style={{ borderRadius: radius.card, overflow: 'hidden', backgroundColor: t.surface, borderWidth: dawn ? 1 : 0, borderColor: t.border }}>
          <ArtSlot id="A18-ritual-reading" height={176} radius={radius.card} scrim={dawn ? 'none' : 'readable'}>
            {!dawn ? (
              <LinearGradient
                colors={['rgba(26,18,6,0.02)', 'rgba(26,18,6,0.26)', 'rgba(20,14,6,0.78)']}
                start={{ x: 0.3, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={{ position: 'absolute', width: '100%', height: '100%' }}
              />
            ) : null}
            <View style={{ flex: 1, padding: spacing.xl, justifyContent: 'flex-end' }}>
              <Text style={[ty.overline, { color: t.gold }]}>
                {localeUpperCase(tr('read.continue'), locale)}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 4 }}>
                <View style={{ flex: 1, paddingRight: spacing.lg }}>
                  <Text numberOfLines={2} style={{ ...ty.titleSmall, color: t.onArtwork, textShadowColor: 'rgba(0,0,0,0.78)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 7 }}>
                    {tr('read.openBible')}
                  </Text>
                  <Text style={{ ...ty.labelMedium, color: 'rgba(242,238,230,0.88)', marginTop: spacing.xs, textShadowColor: 'rgba(0,0,0,0.78)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 }}>
                    {readerBookName} {readerChapter + 1}:{readerVerse + 1} · {chapterProgress}%
                  </Text>
                </View>
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: t.gold, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={getDirectionalIconName('arrow-forward', locale)} size={22} color={t.onGold} />
                </View>
              </View>
            </View>
          </ArtSlot>
        </View>
      </Pressable>

      {/* quick access to Scripture search and the reader's saved verses */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.md }}>
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
              flexGrow: 1,
              flexBasis: 150,
              backgroundColor: t.surface,
              borderRadius: radius.inner,
              borderWidth: 1,
              borderColor: t.border,
              overflow: 'hidden',
              opacity: pressed ? interaction.pressedOpacity : 1,
            })}
          >
            <View
              style={{
                minHeight: 52,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.sm,
                paddingVertical: spacing.md,
              }}
            >
              <Ionicons name={a.icon} size={19} color={t.gold} />
              <Text style={{ ...ty.label, color: t.ink }}>{a.label}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <SectionHeader title={tr('bible.plans')} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: expanded ? foldablePaneGap(width) : spacing.md }}>
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
              accessibilityLabel={p.title}
              accessibilityHint={locked ? tr('today.unlock') : undefined}
              style={{
                flexGrow: expanded ? 1 : undefined,
                flexBasis: expanded ? 320 : undefined,
                width: expanded ? undefined : '100%',
                maxWidth: expanded ? expandedPaneWidth(Math.min(width, contentMaxWidth(width))) : undefined,
              }}
            >
              <View style={{ borderRadius: radius.card, overflow: 'hidden', backgroundColor: t.surface, borderWidth: dawn ? 1 : 0, borderColor: t.border }}>
                <ArtSlot id={p.art} height={150} radius={radius.card} scrim="none">
                  <LinearGradient
                    colors={['rgba(5,8,16,0.02)', 'rgba(5,8,16,0.10)', 'rgba(5,8,16,0.74)']}
                    locations={[0, 0.5, 1]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={{ position: 'absolute', width: '100%', height: '100%' }}
                  />
                  <View style={{ flex: 1, padding: spacing.xl, justifyContent: 'flex-end' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text numberOfLines={2} style={{ ...ty.titleCompact, color: t.onArtwork, flex: 1, textShadowColor: 'rgba(0,0,0,0.78)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 7 }}>
                        {p.title}
                      </Text>
                      {locked ? <Ionicons name="lock-closed" size={18} color={t.sacredGold} /> : null}
                    </View>
                    <Text numberOfLines={2} style={{ ...ty.labelRegular, color: 'rgba(242,238,230,0.86)', marginTop: spacing.xs, textShadowColor: 'rgba(0,0,0,0.78)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 }}>
                      {p.tagline}
                    </Text>
                    <Text
                      style={{
                        ...ty.labelSmallMedium,
                        color: t.gold,
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

      {/* Scripture attribution , each translation carries its own license credit. */}
      <Text
        style={{
          ...ty.labelSmallRegular,
          color: t.inkFaint,
          textAlign: 'center',
          marginTop: spacing.xl,
        }}
      >
        {getBibleCredit(scriptureLocale)}
      </Text>
    </Screen>
  );
}
