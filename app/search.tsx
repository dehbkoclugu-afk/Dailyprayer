import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useArtwork } from '@/hooks/useArtwork';
import { ArtSlot } from '@/components/ArtSlot';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { getBible } from '@/data/bibleFull';
import { useT } from '@/i18n';
import { getDirectionalIconName } from '@/i18n/direction';
import { useScriptureLocale } from '@/i18n/scripture';

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
  const { t: tr, locale } = useT();
  const scriptureLocale = useScriptureLocale();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [q, setQ] = useState(''); // debounced

  useEffect(() => {
    const id = setTimeout(() => setQ(query.trim()), 220);
    return () => clearTimeout(id);
  }, [query]);

  const hits = useMemo<Hit[]>(() => {
    if (q.length < 2) return [];
    const bible = getBible(scriptureLocale);
    const needle = lower(q, scriptureLocale);
    const out: Hit[] = [];
    for (let b = 0; b < bible.length; b++) {
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
  }, [q, scriptureLocale]);

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
            width: 48,
            height: 48,
            borderRadius: 24,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: t.surface,
            borderWidth: 1,
            borderColor: t.border,
          }}
        >
          <Ionicons name={getDirectionalIconName('chevron-back', locale)} size={24} color={t.inkSoft} />
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
            style={{ flex: 1, fontFamily: fonts.sans, fontSize: 16, color: t.ink, paddingVertical: 0 }}
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

      {q.length >= 2 ? (
        <Text
          style={{
            fontFamily: fonts.sansMedium,
            fontSize: 13,
            color: t.inkSoft,
            paddingHorizontal: spacing.xl,
            marginTop: spacing.lg,
          }}
        >
          {hits.length >= MAX ? `${MAX}+ ` : `${hits.length} `}
          {tr('read.results')}
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
              style={{
                fontFamily: fonts.serifLight,
                fontSize: 16,
                lineHeight: 24,
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
                  <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 13, color: t.gold, marginBottom: spacing.xs }}>
                    {item.ref}
                  </Text>
                  <Text style={{ fontFamily: fonts.serifLight, fontSize: 15, lineHeight: 23, color: artwork.foreground.primary }} numberOfLines={3}>
                    {s.pre}
                    <Text style={{ fontFamily: fonts.sansBold, color: t.gold }}>{s.match}</Text>
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
