import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { fonts, type } from '@/theme/typography';
import { radius, spacing, TAP_MIN } from '@/theme/tokens';
import { getBible } from '@/data/bibleFull';
import { searchScripture, type ScriptureHit as Hit } from '@/data/scriptureSearch';
import { useT } from '@/i18n';
import { TopAppBar } from '@/components/TopAppBar';

const MAX = 300;
type BookFilter = 'all' | 'old' | 'new' | number;

export default function Search() {
  const t = useTheme();
  const { t: tr, tn, locale } = useT();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [q, setQ] = useState(''); // debounced
  const [bookFilter, setBookFilter] = useState<BookFilter>('all');
  const [hits, setHits] = useState<Hit[]>([]);
  const bible = useMemo(() => getBible(locale), [locale]);

  useEffect(() => {
    const id = setTimeout(() => setQ(query.trim()), 220);
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    let current = true;
    if (q.length < 2) {
      setHits([]);
      return () => { current = false; };
    }
    searchScripture(bible, q, bookFilter, MAX).then((result) => {
      if (current) setHits(result);
    });
    return () => { current = false; };
  }, [q, bible, bookFilter]);

  const snippet = (h: Hit) => {
    const start = Math.max(0, h.at - 40);
    const pre = (start > 0 ? '…' : '') + h.text.slice(start, h.at);
    const match = h.text.slice(h.at, h.at + q.length);
    const end = Math.min(h.text.length, h.at + q.length + 64);
    const post = h.text.slice(h.at + q.length, end) + (end < h.text.length ? '…' : '');
    return { pre, match, post };
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: insets.top + spacing.md }}>
      {/* search bar */}
      <View style={{ paddingHorizontal: spacing.xl }}>
        <TopAppBar title={tr('read.search')} />
      </View>
      <View style={{ marginTop: spacing.md, paddingHorizontal: spacing.xl }}>
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
            height: TAP_MIN,
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
            style={{ ...type.body, flex: 1, color: t.ink, paddingVertical: 0 }}
          />
          {query.length > 0 ? (
            <Pressable
              onPress={() => setQuery('')}
              accessibilityRole="button"
              accessibilityLabel={tr('a11y.close')}
              style={{
                width: TAP_MIN,
                height: TAP_MIN,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: -spacing.sm,
                borderRadius: TAP_MIN / 2,
                backgroundColor: t.surfaceAlt,
              }}
            >
              <Ionicons name="close-circle" size={18} color={t.inkFaint} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={{ marginTop: spacing.md }}
        contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.xl }}
      >
        {[
          { value: 'all' as const, label: tr('read.allBooks') },
          { value: 'old' as const, label: tr('read.oldTestament') },
          { value: 'new' as const, label: tr('read.newTestament') },
          ...bible.map((book, index) => ({ value: index, label: book.name })),
        ].map((option) => {
          const active = bookFilter === option.value;
          return (
            <Pressable
              key={String(option.value)}
              onPress={() => setBookFilter(option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={{
                minHeight: TAP_MIN,
                justifyContent: 'center',
                paddingHorizontal: spacing.lg,
                borderRadius: radius.pill,
                backgroundColor: active ? t.goldSoft : t.surface,
                borderWidth: 1,
                borderColor: active ? t.gold : t.border,
              }}
            >
              <Text style={{ ...type.labelMedium, color: active ? t.goldText : t.inkSoft }}>{option.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {q.length >= 2 ? (
        <Text
          style={{ ...type.labelMedium, color: t.inkSoft,
            paddingHorizontal: spacing.xl,
            marginTop: spacing.lg }}
        >
          {hits.length >= MAX
            ? tr('read.firstResults')
            : `${hits.length} ${tn(hits.length, 'read.results')}`}
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
          maxWidth: 480,
          width: '100%',
          alignSelf: 'center',
          flexGrow: 1,
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: spacing.xxxl, paddingHorizontal: spacing.xl }}>
            <Ionicons name={q.length >= 2 ? 'search-outline' : 'book-outline'} size={40} color={t.inkFaint} />
            <Text
              style={{ ...type.quoteSmall, lineHeight: 24,
                color: t.inkSoft,
                textAlign: 'center',
                marginTop: spacing.lg,
                maxWidth: 280 }}
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
                padding: spacing.lg,
                marginBottom: spacing.md,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ ...type.labelSemi, color: t.goldText, marginBottom: spacing.xs }}>
                {item.ref}
              </Text>
              <Text style={{ ...type.quoteSmall, lineHeight: 23, color: t.ink }} numberOfLines={2}>
                {s.pre}
                <Text style={{ fontFamily: fonts.sansBold, color: t.goldText }}>{s.match}</Text>
                {s.post}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
