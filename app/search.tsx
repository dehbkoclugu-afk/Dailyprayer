import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useArtwork } from '@/hooks/useArtwork';
import { ArtSlot } from '@/components/ArtSlot';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { getBible, type FullBook } from '@/data/bibleFull';
import { findMatch, foldForSearch, minimumQueryLength } from '@/lib/search';
import { useT } from '@/i18n';
import { useScriptureLocale } from '@/i18n/scripture';
import type { GlobalLocaleTag } from '@/i18n/globalLanguageCatalog';
import { BackButton } from '@/components/BackButton';

interface Hit {
  code: string;
  chapter: number;
  verse: string;
  ref: string;
  text: string;
  start: number; // match span in the original text
  end: number;
}

const MAX = 300;
/** Verses scanned per slice before yielding back to the UI thread. */
const SLICE = 2500;

/**
 * Folded verse text per edition, filled lazily during scans (so the cost is
 * spread over UI-friendly slices) and reused by every later query.
 */
const foldedCache = new Map<string, { bible: FullBook[]; folded: string[] }>();
function foldedFor(locale: GlobalLocaleTag): { bible: FullBook[]; folded: string[] } {
  const bible = getBible(locale);
  const cached = foldedCache.get(locale);
  if (cached && cached.bible === bible) return cached;
  const entry = { bible, folded: [] as string[] };
  foldedCache.set(locale, entry);
  return entry;
}

export default function Search() {
  const t = useTheme();
  const artwork = useArtwork();
  const { t: tr } = useT();
  const scriptureLocale = useScriptureLocale();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [q, setQ] = useState(''); // debounced

  useEffect(() => {
    const id = setTimeout(() => setQ(query.trim()), 220);
    return () => clearTimeout(id);
  }, [query]);

  const minLength = minimumQueryLength(q);
  const active = q.length >= minLength;
  const [hits, setHits] = useState<Hit[]>([]);
  const [searching, setSearching] = useState(false);

  // Scan in slices so typing stays responsive; a newer query cancels the old scan.
  useEffect(() => {
    if (!active) {
      setHits([]);
      setSearching(false);
      return;
    }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    setSearching(true);
    timer = setTimeout(() => {
      const { bible, folded } = foldedFor(scriptureLocale);
      const needle = foldForSearch(q, scriptureLocale);
      const out: Hit[] = [];
      let b = 0;
      let c = 0;
      let v = 0;
      let flat = 0;
      const step = () => {
        if (cancelled) return;
        let budget = SLICE;
        while (b < bible.length && budget-- > 0 && out.length < MAX) {
          const book = bible[b];
          const chapter = book.chapters[c];
          const [label, text] = chapter[v];
          const haystack = (folded[flat] ??= foldForSearch(text, scriptureLocale));
          if (haystack.includes(needle)) {
            const span = findMatch(text, haystack, needle, scriptureLocale);
            if (span) {
              out.push({ code: book.code, chapter: c, verse: label, ref: `${book.name} ${c + 1}:${label}`, text, ...span });
            }
          }
          flat++;
          if (++v >= chapter.length) {
            v = 0;
            if (++c >= book.chapters.length) {
              c = 0;
              b++;
            }
          }
        }
        setHits([...out]);
        if (b < bible.length && out.length < MAX) timer = setTimeout(step, 0);
        else setSearching(false);
      };
      step();
    }, 0);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [active, q, scriptureLocale]);

  const snippet = (h: Hit) => {
    const from = Math.max(0, h.start - 40);
    const pre = (from > 0 ? '…' : '') + h.text.slice(from, h.start);
    return { pre, match: h.text.slice(h.start, h.end), post: h.text.slice(h.end) };
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: insets.top + spacing.md }}>
      {/* search bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.xl }}>
        <BackButton />
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
            height: 44,
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
            <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityRole="button" accessibilityLabel={tr('a11y.close')}>
              <Ionicons name="close-circle" size={18} color={t.inkFaint} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {active ? (
        <Text
          style={{
            fontFamily: fonts.sansMedium,
            fontSize: 13,
            color: t.inkSoft,
            paddingHorizontal: spacing.xl,
            marginTop: spacing.lg,
          }}
        >
          {hits.length >= MAX ? `${MAX}+ ` : `${hits.length}${searching ? '…' : ''} `}
          {tr('read.results')}
        </Text>
      ) : null}

      <FlatList
        data={hits}
        keyExtractor={(h) => `${h.code}|${h.chapter}|${h.verse}`}
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
            <Ionicons name={active ? 'search-outline' : 'book-outline'} size={40} color={t.inkFaint} />
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
              {active ? (searching ? '…' : tr('read.searchEmpty')) : tr('read.searchPrompt')}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const s = snippet(item);
          return (
            <Pressable
              onPress={() =>
                router.push({ pathname: '/read', params: { b: item.code, c: item.chapter, v: item.verse } })
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
