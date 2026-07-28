import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { fonts, type } from '@/theme/typography';
import { radius, spacing, TAP_MIN } from '@/theme/tokens';
import { getBible } from '@/data/bibleFull';
import { useT } from '@/i18n';

interface Hit {
  book: number;
  chapter: number;
  verse: number;
  ref: string;
  text: string;
  at: number; // match offset in text
}

const lower = (s: string) => s.toLocaleLowerCase('tr');
const MAX = 300;

export default function Search() {
  const t = useTheme();
  const { t: tr, tn, locale } = useT();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [q, setQ] = useState(''); // debounced

  useEffect(() => {
    const id = setTimeout(() => setQ(query.trim()), 220);
    return () => clearTimeout(id);
  }, [query]);

  const hits = useMemo<Hit[]>(() => {
    if (q.length < 2) return [];
    const bible = getBible(locale);
    const needle = lower(q);
    const out: Hit[] = [];
    for (let b = 0; b < bible.length; b++) {
      const bk = bible[b];
      for (let c = 0; c < bk.chapters.length; c++) {
        const ch = bk.chapters[c];
        for (let v = 0; v < ch.length; v++) {
          const text = ch[v][1];
          const at = lower(text).indexOf(needle);
          if (at !== -1) {
            out.push({ book: b, chapter: c, verse: v, ref: `${bk.name} ${c + 1}:${ch[v][0]}`, text, at });
            if (out.length >= MAX) return out;
          }
        }
      }
    }
    return out;
  }, [q, locale]);

  const snippet = (h: Hit) => {
    const start = Math.max(0, h.at - 40);
    const pre = (start > 0 ? '…' : '') + h.text.slice(start, h.at);
    const match = h.text.slice(h.at, h.at + q.length);
    const post = h.text.slice(h.at + q.length);
    return { pre, match, post };
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: insets.top + spacing.md }}>
      {/* search bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.xl }}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={tr('a11y.back')}
          style={{
            width: TAP_MIN,
            height: TAP_MIN,
            borderRadius: 22,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: t.surface,
            borderWidth: 1,
            borderColor: t.border,
          }}
        >
          <Ionicons name="chevron-back" size={24} color={t.inkSoft} />
        </Pressable>
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

      {q.length >= 2 ? (
        <Text
          style={{ ...type.labelMedium, color: t.inkSoft,
            paddingHorizontal: spacing.xl,
            marginTop: spacing.lg }}
        >
          {hits.length >= MAX ? `${MAX}+ ` : `${hits.length} `}
          {tn(hits.length >= MAX ? MAX : hits.length, 'read.results')}
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
              <Text style={{ ...type.quoteSmall, lineHeight: 23, color: t.ink }} numberOfLines={3}>
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
