import React, { useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, Share, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
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
  const isPlus = useEntitlementStore((state) => state.isPlus);
  const { keys: highlightKeys, toggle: toggleHighlight } = useHighlightStore();
  const openIdx = useBibleStore((state) => state.chapterIndex);
  const setOpenIdx = useBibleStore((state) => state.setChapterIndex);
  const savedVerseKeys = useBibleStore((state) => state.savedVerseKeys);
  const toggleSavedVerse = useBibleStore((state) => state.toggleSavedVerse);
  const planProgress = useBibleStore((state) => state.planProgress);
  const [query, setQuery] = useState('');
  const chapter = sampleChapters[openIdx];
  const availableBooks = [...new Set(sampleChapters.map((item) => item.book))];
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleChapters = sampleChapters
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.book === chapter.book)
    .filter(({ item }) =>
      normalizedQuery
        ? `${item.book} ${item.chapter}`.toLocaleLowerCase().includes(normalizedQuery)
        : true,
    );

  const referenceFor = (index: number) => `${chapter.book} ${chapter.chapter}:${index + 1}`;
  const keyFor = (index: number) => `${chapter.book}|${chapter.chapter}|${index}`;

  const copyVerse = async (verse: string, index: number) => {
    await Clipboard.setStringAsync(`${verse}\n— ${referenceFor(index)}`);
    toast(translate('toast.copied'));
  };

  const openVerseActions = (verse: string, index: number) => {
    const key = keyFor(index);
    const highlighted = highlightKeys.includes(key);
    const saved = savedVerseKeys.includes(key);
    Alert.alert(referenceFor(index), verse, [
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
        onPress: () => Share.share({ message: `${verse}\n— ${referenceFor(index)}` }),
      },
    ]);
  };

  const openBook = (book: string) => {
    const index = sampleChapters.findIndex((item) => item.book === book);
    if (index >= 0) {
      setOpenIdx(index);
      setQuery('');
    }
  };

  const header = (
    <>
      <Text style={[ty.title, { color: t.ink }]}>{tr('bible.title')}</Text>
      <Text style={[ty.secondary, { color: t.inkSoft, marginTop: spacing.xs }]}>
        {tr('bible.sub')}
      </Text>
      {savedVerseKeys.length > 0 ? (
        <Pressable
          onPress={() => router.push('/saved-verses')}
          accessibilityRole="button"
          accessibilityLabel={`${tr('bible.savedVerses')}: ${savedVerseKeys.length}`}
          style={{
            minHeight: 48,
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-start',
            gap: spacing.sm,
            marginTop: spacing.sm,
          }}
        >
          <Ionicons name="bookmark-outline" size={18} color={t.blue} />
          <Text style={{ fontFamily: fonts.sansMedium, fontSize: 14, color: t.blue }}>
            {tr('bible.savedVerses')} · {savedVerseKeys.length}
          </Text>
        </Pressable>
      ) : null}
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
      <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 13, color: t.inkSoft, marginTop: spacing.lg }}>
        {tr('bible.books')}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: spacing.sm, marginHorizontal: -spacing.xl }}
        contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.xl }}
      >
        {availableBooks.map((book) => {
          const active = book === chapter.book;
          return (
            <Pressable
              key={book}
              onPress={() => openBook(book)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={{
                minHeight: 48,
                justifyContent: 'center',
                borderRadius: radius.pill,
                borderWidth: 1,
                borderColor: active ? t.gold : t.border,
                backgroundColor: active ? t.goldSoft : 'transparent',
                paddingHorizontal: spacing.lg,
              }}
            >
              <Text style={{ fontFamily: fonts.sansMedium, fontSize: 14, color: active ? t.gold : t.inkSoft }}>
                {book}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 13, color: t.inkSoft, marginTop: spacing.md }}>
        {tr('bible.chapters')}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: spacing.sm, marginHorizontal: -spacing.xl }}
        contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.xl }}
      >
        {visibleChapters.map(({ item, index }) => {
          const active = index === openIdx;
          return (
            <Pressable
              key={`${item.book}-${item.chapter}`}
              onPress={() => setOpenIdx(index)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={{
                minWidth: 48,
                minHeight: 48,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: radius.pill,
                borderWidth: 1,
                borderColor: active ? t.gold : t.border,
                backgroundColor: active ? t.goldSoft : 'transparent',
                paddingHorizontal: spacing.md,
              }}
            >
              <Text style={{ fontFamily: fonts.sansMedium, fontSize: 14, color: active ? t.gold : t.inkSoft }}>
                {item.chapter}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {visibleChapters.length === 0 ? (
        <Text style={{ fontFamily: fonts.sans, fontSize: 14, color: t.inkSoft, marginTop: spacing.sm }}>
          {tr('bible.noResults')}
        </Text>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: spacing.xl,
          marginBottom: spacing.md,
        }}
      >
        <Pressable
          onPress={() => setOpenIdx(Math.max(0, openIdx - 1))}
          disabled={openIdx === 0}
          accessibilityRole="button"
          accessibilityState={{ disabled: openIdx === 0 }}
          accessibilityLabel={tr('bible.previousChapter')}
          style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center', opacity: openIdx === 0 ? 0.35 : 1 }}
        >
          <Ionicons name="chevron-back" size={22} color={t.blue} />
        </Pressable>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={[ty.title, { color: t.ink }]}>{chapter.book} {chapter.chapter}</Text>
          <Text style={{ fontFamily: fonts.sans, fontSize: 12, color: t.inkSoft, marginTop: spacing.xs }}>
            {tr('bible.highlightHint')}
          </Text>
        </View>
        <Pressable
          onPress={() => setOpenIdx(Math.min(sampleChapters.length - 1, openIdx + 1))}
          disabled={openIdx === sampleChapters.length - 1}
          accessibilityRole="button"
          accessibilityState={{ disabled: openIdx === sampleChapters.length - 1 }}
          accessibilityLabel={tr('bible.nextChapter')}
          style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center', opacity: openIdx === sampleChapters.length - 1 ? 0.35 : 1 }}
        >
          <Ionicons name="chevron-forward" size={22} color={t.blue} />
        </Pressable>
      </View>
    </>
  );

  const footer = (
    <>
      <SectionHeader title={tr('bible.plans')} />
      <View style={{ gap: spacing.md }}>
        {plans.map((plan) => {
          const locked = plan.plus && !isPlus;
          return (
            <Pressable
              key={plan.id}
              onPress={() => router.push({ pathname: '/plan', params: { id: plan.id } })}
              accessibilityRole="button"
              accessibilityLabel={`${plan.title}${locked ? `, ${tr('bible.requiresPlus')}` : ''}`}
            >
              <View style={{ borderRadius: radius.card, overflow: 'hidden' }}>
                <ArtSlot id={planArt(plan.id)} height={150} radius={radius.card}>
                  <LinearGradient
                    colors={['rgba(14,18,32,0.1)', `${plan.gradient[1]}E6`]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={{ position: 'absolute', width: '100%', height: '100%' }}
                  />
                  <View style={{ flex: 1, padding: spacing.xl, justifyContent: 'flex-end' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontFamily: fonts.serif, fontSize: 20, color: '#F2EEE6', flex: 1 }}>
                        {plan.title}
                      </Text>
                      {locked ? <Ionicons name="lock-closed" size={18} color="#D9A441" /> : null}
                    </View>
                    <Text style={{ fontFamily: fonts.sans, fontSize: 14, color: 'rgba(242,238,230,0.75)', marginTop: spacing.xs }}>
                      {plan.tagline}
                    </Text>
                    <Text style={{ fontFamily: fonts.sansMedium, fontSize: 12, color: '#D9A441', marginTop: spacing.sm }}>
                      {(planProgress[plan.id] ?? 0) > 0
                        ? `${planProgress[plan.id]} / ${plan.days} ${tr('bible.days')}`
                        : `${plan.days} ${tr('bible.days')}`}
                    </Text>
                  </View>
                </ArtSlot>
              </View>
            </Pressable>
          );
        })}
      </View>
    </>
  );

  return (
    <Screen tabbed scroll={false}>
      <FlatList
        data={chapter.verses.map((text, index) => ({ text, index }))}
        key={`${chapter.book}-${chapter.chapter}`}
        keyExtractor={({ index }) => `${chapter.book}-${chapter.chapter}-${index}`}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        initialNumToRender={12}
        windowSize={7}
        renderItem={({ item }) => {
          const key = keyFor(item.index);
          const highlighted = highlightKeys.includes(key);
          return (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: highlighted ? t.goldSoft : t.surface,
                borderRadius: radius.inner,
                marginBottom: spacing.sm,
              }}
            >
              <Pressable
                onPress={() => openVerseActions(item.text, item.index)}
                accessibilityRole="button"
                accessibilityLabel={`${referenceFor(item.index)}. ${item.text}`}
                accessibilityState={{ selected: highlighted }}
                style={{ flex: 1, minHeight: 48, justifyContent: 'center', padding: spacing.lg }}
              >
                <Text style={{ fontFamily: fonts.serifLight, fontSize: 19, lineHeight: 32, color: t.ink }}>
                  <Text style={{ fontFamily: fonts.sansBold, fontSize: 11, color: t.gold }}>
                    {item.index + 1}{'  '}
                  </Text>
                  {item.text}
                  {savedVerseKeys.includes(key) ? '  ◆' : ''}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => copyVerse(item.text, item.index)}
                accessibilityRole="button"
                accessibilityLabel={`${tr('bible.copy')} ${referenceFor(item.index)}`}
                style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name="copy-outline" size={19} color={t.inkSoft} />
              </Pressable>
            </View>
          );
        }}
      />
    </Screen>
  );
}
