import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Share, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { ArtSlot } from '@/components/ArtSlot';
import { planArt } from '@/assets/registry';
import { useTheme } from '@/hooks/useTheme';
import { fonts, type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { sampleChapters } from '@/data/bible';
import { plans } from '@/data/plans';
import { useEntitlementStore } from '@/state/useEntitlementStore';
import { useHighlightStore } from '@/state/useHighlightStore';
import { toast } from '@/state/useToastStore';
import { useT, translate } from '@/i18n';
import { useBibleStore } from '@/state/useBibleStore';

export default function Bible() {
  const t = useTheme();
  const { t: tr } = useT();
  const isPlus = useEntitlementStore((s) => s.isPlus);
  const { keys: highlightKeys, toggle: toggleHighlight } = useHighlightStore();
  const openIdx = useBibleStore((s) => s.chapterIndex);
  const setOpenIdx = useBibleStore((s) => s.setChapterIndex);
  const savedVerseKeys = useBibleStore((s) => s.savedVerseKeys);
  const toggleSavedVerse = useBibleStore((s) => s.toggleSavedVerse);
  const planProgress = useBibleStore((s) => s.planProgress);
  const [query, setQuery] = useState('');
  const chapter = sampleChapters[openIdx];
  const visibleChapters = sampleChapters
    .map((item, index) => ({ item, index }))
    .filter(({ item }) =>
      `${item.book} ${item.chapter}`.toLowerCase().includes(query.trim().toLowerCase()),
    );

  const openVerseActions = (verse: string, index: number) => {
    const key = `${chapter.book}|${chapter.chapter}|${index}`;
    const highlighted = highlightKeys.includes(key);
    const saved = savedVerseKeys.includes(key);
    Alert.alert(`${chapter.book} ${chapter.chapter}:${index + 1}`, verse, [
      {
        text: highlighted ? tr('bible.removeHighlight') : tr('bible.highlight'),
        onPress: () => {
          const on = toggleHighlight(key);
          toast(translate(on ? 'toast.highlightOn' : 'toast.highlightOff'));
        },
      },
      {
        text: saved ? tr('bible.unsave') : tr('bible.save'),
        onPress: () => toggleSavedVerse(key),
      },
      {
        text: tr('bible.share'),
        onPress: () =>
          Share.share({
            message: `${verse}\n— ${chapter.book} ${chapter.chapter}:${index + 1}`,
          }),
      },
    ]);
  };

  return (
    <Screen tabbed>
      <Text style={[ty.title, { color: t.ink }]}>{tr('bible.title')}</Text>
      <Text style={[ty.secondary, { color: t.inkSoft, marginTop: spacing.xs }]}>
{tr('bible.sub')}
      </Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={tr('bible.search')}
        placeholderTextColor={t.inkSoft}
        accessibilityLabel={tr('bible.search')}
        style={{
          minHeight: 48,
          backgroundColor: t.surface,
          color: t.ink,
          borderColor: t.border,
          borderWidth: 1,
          borderRadius: radius.inner,
          paddingHorizontal: spacing.lg,
          marginTop: spacing.lg,
          fontFamily: fonts.sans,
          fontSize: 16,
        }}
      />

      {/* chapter picker — single horizontal row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: spacing.lg, marginHorizontal: -spacing.xl }}
        contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.xl }}
      >
        {visibleChapters.map(({ item: c, index: i }) => {
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
                minHeight: 48,
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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md }}>
          <Pressable
            onPress={() => setOpenIdx(Math.max(0, openIdx - 1))}
            disabled={openIdx === 0}
            accessibilityRole="button"
            accessibilityState={{ disabled: openIdx === 0 }}
            style={{ minHeight: 48, justifyContent: 'center', opacity: openIdx === 0 ? 0.35 : 1 }}
          >
            <Text style={{ fontFamily: fonts.sansMedium, fontSize: 14, color: t.blue }}>
              {tr('bible.previousChapter')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setOpenIdx(Math.min(sampleChapters.length - 1, openIdx + 1))}
            disabled={openIdx === sampleChapters.length - 1}
            accessibilityRole="button"
            accessibilityState={{ disabled: openIdx === sampleChapters.length - 1 }}
            style={{
              minHeight: 48,
              justifyContent: 'center',
              opacity: openIdx === sampleChapters.length - 1 ? 0.35 : 1,
            }}
          >
            <Text style={{ fontFamily: fonts.sansMedium, fontSize: 14, color: t.blue }}>
              {tr('bible.nextChapter')}
            </Text>
          </Pressable>
        </View>
        {chapter.verses.map((v, i) => {
          const hKey = `${chapter.book}|${chapter.chapter}|${i}`;
          const highlighted = highlightKeys.includes(hKey);
          return (
          <Pressable
            key={i}
            onPress={() => openVerseActions(v, i)}
            accessibilityRole="button"
            accessibilityLabel={`${chapter.book} ${chapter.chapter}:${i + 1}. ${v}`}
            accessibilityState={{ selected: highlighted }}
            style={{
              minHeight: 48,
              justifyContent: 'center',
              marginBottom: spacing.md,
              backgroundColor: highlighted ? t.goldSoft : 'transparent',
            }}
          >
            <Text style={{ fontFamily: fonts.serifLight, fontSize: 19, lineHeight: 34, color: t.ink }}>
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
              {savedVerseKeys.includes(hKey) ? '  ◆' : ''}
            </Text>
          </Pressable>
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
              onPress={() =>
                locked
                  ? router.push(`/paywall?from=plan-${p.id}`)
                  : router.push({ pathname: '/plan', params: { id: p.id } })
              }
              accessibilityRole="button"
              accessibilityLabel={`${p.title}${locked ? ', requires Plus' : ''}`}
            >
              <View style={{ borderRadius: radius.card, overflow: 'hidden' }}>
                <ArtSlot id={planArt(p.id)} height={150} radius={radius.card}>
                  {/* light bottom-up scrim: art shows at top, title stays legible */}
                  <LinearGradient
                    colors={['rgba(14,18,32,0.1)', `${p.gradient[1]}E6`]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
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
                      {(planProgress[p.id] ?? 0) > 0
                        ? `${planProgress[p.id]} / ${p.days} ${tr('bible.days')}`
                        : `${p.days} ${tr('bible.days')}`}
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
