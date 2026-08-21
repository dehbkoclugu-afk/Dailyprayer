import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useArtwork } from '@/hooks/useArtwork';
import { ArtSlot } from '@/components/ArtSlot';
import { type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { getBible } from '@/data/bibleFull';
import { useT } from '@/i18n';
import { useScriptureLocale } from '@/i18n/scripture';
import { TopAppBar } from '@/components/TopAppBar';
import {
  filterIncludesBook,
  newTestamentStart,
  searchSnippet,
  type ScriptureFilter,
} from '@/lib/scriptureNavigation';
import { testamentLabels } from '@/i18n/testamentLabels';
import {
  getScriptureSearchIndex,
  searchScriptureIndex,
  type ScriptureSearchHit,
  type ScriptureSearchIndex,
} from '@/lib/scriptureSearch';
const MAX = 300;

export default function Search() {
  const t = useTheme();
  const artwork = useArtwork();
  const { t: tr, locale } = useT();
  const scriptureLocale = useScriptureLocale();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [q, setQ] = useState(''); // debounced
  const [filter, setFilter] = useState<ScriptureFilter>('all');
  const bible = useMemo(() => getBible(scriptureLocale), [scriptureLocale]);
  const [index, setIndex] = useState<ScriptureSearchIndex | null>(null);
  const [indexError, setIndexError] = useState(false);
  const [indexAttempt, setIndexAttempt] = useState(0);
  const testamentStart = newTestamentStart(bible.map((book) => book.code));
  const [oldTestament, newTestament] = testamentLabels(locale);

  useEffect(() => {
    const id = setTimeout(() => setQ(query.trim()), 220);
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    let active = true;
    setIndex(null);
    setIndexError(false);
    getScriptureSearchIndex(bible, scriptureLocale).then((next) => {
      if (active) setIndex(next);
    }).catch(() => {
      if (active) setIndexError(true);
    });
    return () => { active = false; };
  }, [bible, indexAttempt, scriptureLocale]);

  const hits = useMemo<ScriptureSearchHit[]>(() => index
    ? searchScriptureIndex(index, q, {
        max: MAX,
        includesBook: (book) => filterIncludesBook(filter, book, testamentStart),
      })
    : [], [filter, index, q, testamentStart]);

  const snippet = (h: ScriptureSearchHit) => {
    return searchSnippet(h.text, h.at, q.length);
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: insets.top + spacing.md }}>
      <View style={{ paddingHorizontal: spacing.xl }}>
        <TopAppBar title={tr('read.search')} />
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            backgroundColor: t.surface,
            borderWidth: 1,
            borderColor: t.border,
            borderRadius: radius.pill,
            paddingHorizontal: spacing.lg,
            height: 48,
          }}
        >
          <Ionicons name="search" size={18} color={t.inkFaint} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={tr('read.searchPlaceholder')}
            placeholderTextColor={t.inkFaint}
            autoFocus
            returnKeyType="search"
            accessibilityLabel={tr('read.searchScripture')}
            style={{ flex: 1, ...ty.bodyCompact, color: t.ink, paddingVertical: 0 }}
          />
          {query.length > 0 ? (
            <Pressable
              onPress={() => setQuery('')}
              accessibilityRole="button"
              accessibilityLabel={tr('a11y.close')}
              style={({ pressed }) => ({
                width: 48,
                height: 48,
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: -spacing.md,
                backgroundColor: pressed ? t.surfaceAlt : 'transparent',
              })}
            >
              <Ionicons name="close-circle" size={18} color={t.inkFaint} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: spacing.md }}
        contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.xl }}
      >
        {([
          ['all', tr('pray.showAll')],
          ['old', oldTestament],
          ['new', newTestament],
          ...bible.map((book, index) => [`book:${index}`, book.name]),
        ] as [ScriptureFilter, string][]).map(([value, label]) => {
          const active = filter === value;
          return (
            <Pressable
              key={value}
              onPress={() => setFilter(value)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={{ minHeight: 48, justifyContent: 'center', paddingHorizontal: spacing.lg, borderRadius: radius.pill, backgroundColor: active ? t.gold : t.surface, borderWidth: 1, borderColor: active ? t.gold : t.border }}
            >
              <Text style={[ty.label, { color: active ? t.onGold : t.inkSoft }]}>{label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {q.length >= 2 && index ? (
        <Text
          style={{
            ...ty.caption,
            color: t.inkSoft,
            paddingHorizontal: spacing.xl,
            marginTop: spacing.lg,
          }}
        >
          {hits.length >= MAX ? `${MAX} ${tr('read.results')} · ${tr('read.pickBook')}` : `${hits.length} ${tr('read.results')}`}
        </Text>
      ) : null}

      <FlatList
        data={hits}
        keyExtractor={(h) => `${h.book}|${h.chapter}|${h.verse}`}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.md,
          paddingBottom: insets.bottom + spacing.xl,
          maxWidth: 840,
          width: '100%',
          alignSelf: 'center',
          flexGrow: 1,
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: spacing.xxxl, paddingHorizontal: spacing.xl }}>
            {!index && !indexError ? <ActivityIndicator color={t.gold} /> : (
              <Ionicons name={q.length >= 2 ? 'search-outline' : 'book-outline'} size={40} color={t.inkFaint} />
            )}
            <Text
              style={{
                ...ty.editorialCompact,
                color: t.inkSoft,
                textAlign: 'center',
                marginTop: spacing.lg,
                maxWidth: 280,
              }}
            >
              {indexError ? tr('paywall.purchaseFailBody') : !index ? tr('paywall.processing') : q.length >= 2 ? tr('read.searchEmpty') : tr('read.searchPrompt')}
            </Text>
            {indexError ? (
              <Pressable
                onPress={() => setIndexAttempt((attempt) => attempt + 1)}
                accessibilityRole="button"
                style={{ minHeight: 48, justifyContent: 'center', paddingHorizontal: spacing.xl, marginTop: spacing.md }}
              >
                <Text style={{ ...ty.label, color: t.blue }}>{tr('paywall.retry')}</Text>
              </Pressable>
            ) : null}
          </View>
        }
        renderItem={({ item }) => {
          const s = snippet(item);
          return (
            <Pressable
              onPress={() =>
                router.push({ pathname: '/read', params: { b: item.book, c: item.chapter, v: item.verse } })
              }
              accessibilityRole="button"
              accessibilityLabel={item.ref}
              style={({ pressed }) => ({
                backgroundColor: t.surface,
                borderRadius: radius.card,
                borderWidth: 1,
                borderColor: t.border,
                overflow: 'hidden',
                marginBottom: spacing.md,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <ArtSlot id="A18-ritual-reading" scrim="readable" radius={radius.card} style={{ width: '100%' }}>
                <View style={{ padding: spacing.lg, minHeight: 88 }}>
                  <Text style={{ ...ty.captionStrong, color: t.gold, marginBottom: spacing.xs }}>
                    {item.ref}
                  </Text>
                  <Text style={{ ...ty.editorialSecondary, color: artwork.foreground.primary }} numberOfLines={2}>
                    {s.pre}
                    <Text style={{ ...ty.labelSmallBold, color: t.gold }}>{s.match}</Text>
                    {s.post}
                  </Text>
                </View>
              </ArtSlot>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
