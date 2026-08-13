import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
  testamentLabels,
  type ScriptureFilter,
} from '@/lib/scriptureNavigation';

interface Hit {
  book: number;
  chapter: number;
  verse: number;
  ref: string;
  text: string;
  at: number; // match offset in text
}

const lower = (s: string, locale: string) => s.toLocaleLowerCase(locale);
const MAX = 300;

export default function Search() {
  const t = useTheme();
  const artwork = useArtwork();
  const { t: tr } = useT();
  const scriptureLocale = useScriptureLocale();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [q, setQ] = useState(''); // debounced
  const [filter, setFilter] = useState<ScriptureFilter>('all');
  const bible = useMemo(() => getBible(scriptureLocale), [scriptureLocale]);
  const testamentStart = newTestamentStart(bible.map((book) => book.code));
  const [oldTestament, newTestament] = testamentLabels(scriptureLocale);

  useEffect(() => {
    const id = setTimeout(() => setQ(query.trim()), 220);
    return () => clearTimeout(id);
  }, [query]);

  const hits = useMemo<Hit[]>(() => {
    if (q.length < 2) return [];
    const needle = lower(q, scriptureLocale);
    const out: Hit[] = [];
    for (let b = 0; b < bible.length; b++) {
      if (!filterIncludesBook(filter, b, testamentStart)) continue;
      const bk = bible[b];
      for (let c = 0; c < bk.chapters.length; c++) {
        const ch = bk.chapters[c];
        for (let v = 0; v < ch.length; v++) {
          const text = ch[v][1];
          const at = lower(text, scriptureLocale).indexOf(needle);
          if (at !== -1) {
            out.push({ book: b, chapter: c, verse: v, ref: `${bk.name} ${c + 1}:${ch[v][0]}`, text, at });
            if (out.length >= MAX) return out;
          }
        }
      }
    }
    return out;
  }, [bible, filter, q, scriptureLocale, testamentStart]);

  const snippet = (h: Hit) => {
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

      {q.length >= 2 ? (
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
            <Ionicons name={q.length >= 2 ? 'search-outline' : 'book-outline'} size={40} color={t.inkFaint} />
            <Text
              style={{
                ...ty.editorialCompact,
                color: t.inkSoft,
                textAlign: 'center',
                marginTop: spacing.lg,
                maxWidth: 280,
              }}
            >
              {q.length >= 2 ? tr('read.searchEmpty') : tr('read.searchPrompt')}
            </Text>
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
              <ArtSlot id="A18-ritual-reading" variant="row" radius={radius.card} style={{ width: '100%' }}>
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
