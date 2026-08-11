import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useArtwork } from '@/hooks/useArtwork';
import { ArtSlot } from '@/components/ArtSlot';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { HIGHLIGHT_SWATCH } from '@/theme/highlights';
import { getBible } from '@/data/bibleFull';
import { useBookmarkStore } from '@/state/useBookmarkStore';
import { useHighlightStore } from '@/state/useHighlightStore';
import { useT } from '@/i18n';
import { getDirectionalIconName } from '@/i18n/direction';

type Tab = 'bookmarks' | 'highlights';

interface Row {
  book: number;
  chapter: number;
  verse: number;
  ref: string;
  preview: string;
  color?: string;
  markKey?: string;
}

export default function Library() {
  const t = useTheme();
  const artwork = useArtwork();
  const { t: tr, locale } = useT();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('bookmarks');

  const bookmarks = useBookmarkStore((s) => s.bookmarks);
  const removeBookmark = useBookmarkStore((s) => s.remove);
  const marks = useHighlightStore((s) => s.marks);
  const clearMark = useHighlightStore((s) => s.clear);

  const bookmarkRows = useMemo<Row[]>(
    () =>
      bookmarks.map((m) => ({
        book: m.book,
        chapter: m.chapter,
        verse: m.verse,
        ref: m.ref,
        preview: m.preview,
      })),
    [bookmarks],
  );

  const highlightRows = useMemo<Row[]>(() => {
    const bible = getBible(locale);
    const rows: Row[] = [];
    for (const [key, color] of Object.entries(marks)) {
      const [code, cStr, vStr] = key.split('|');
      const b = bible.findIndex((bk) => bk.code === code);
      if (b < 0) continue;
      const c = Number(cStr);
      const v = Number(vStr);
      const ch = bible[b].chapters[c];
      if (!ch || !ch[v]) continue;
      const text = ch[v][1];
      rows.push({
        book: b,
        chapter: c,
        verse: v,
        ref: `${bible[b].name} ${c + 1}:${ch[v][0]}`,
        preview: text.length > 90 ? `${text.slice(0, 90).trimEnd()}…` : text,
        color: HIGHLIGHT_SWATCH[color],
        markKey: key,
      });
    }
    return rows;
  }, [marks, locale]);

  const rows = tab === 'bookmarks' ? bookmarkRows : highlightRows;

  const segment = (key: Tab, label: string, count: number) => {
    const active = tab === key;
    return (
      <Pressable
        onPress={() => setTab(key)}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          paddingVertical: 9,
          borderRadius: radius.pill,
          backgroundColor: active ? t.gold : 'transparent',
        }}
      >
        <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 14, color: active ? t.onGold : t.inkSoft }}>
          {label}
        </Text>
        <Text
          style={{
            fontFamily: fonts.sansBold,
            fontSize: 12,
            color: active ? t.onGold : t.inkFaint,
            fontVariant: ['tabular-nums'],
          }}
        >
          {count}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: insets.top + spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.xl }}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={tr('a11y.back')}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: t.surface,
            borderWidth: 1,
            borderColor: t.border,
          }}
        >
          <Ionicons name={getDirectionalIconName('chevron-back', locale)} size={24} color={t.inkSoft} />
        </Pressable>
        <Text style={{ fontFamily: fonts.serif, fontSize: 24, color: t.ink }}>{tr('library.title')}</Text>
      </View>

      {/* segmented control */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: t.surface,
          borderRadius: radius.pill,
          padding: 4,
          marginHorizontal: spacing.xl,
          marginTop: spacing.lg,
          borderWidth: 1,
          borderColor: t.border,
        }}
      >
        {segment('bookmarks', tr('library.bookmarks'), bookmarkRows.length)}
        {segment('highlights', tr('library.highlights'), highlightRows.length)}
      </View>

      <FlatList
        data={rows}
        keyExtractor={(r) => `${r.book}|${r.chapter}|${r.verse}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.lg,
          paddingBottom: insets.bottom + spacing.xl,
          maxWidth: 480,
          width: '100%',
          alignSelf: 'center',
          flexGrow: 1,
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: spacing.xxxl, paddingHorizontal: spacing.xl }}>
            <Ionicons name={tab === 'bookmarks' ? 'bookmark-outline' : 'color-fill-outline'} size={40} color={t.inkFaint} />
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
              {tr('library.empty')}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, minHeight: 84 }}>
                {item.color ? (
                  <View style={{ width: 6, alignSelf: 'stretch', borderRadius: 3, backgroundColor: item.color }} />
                ) : (
                  <Ionicons name="bookmark" size={18} color={t.gold} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 14, color: t.gold }}>{item.ref}</Text>
                  <Text
                    style={{ fontFamily: fonts.serifLight, fontSize: 14, lineHeight: 21, color: artwork.foreground.secondary, marginTop: 2 }}
                    numberOfLines={2}
                  >
                    {item.preview}
                  </Text>
                </View>
                <Pressable
                  onPress={() =>
                    item.markKey ? clearMark(item.markKey) : removeBookmark(item.book, item.chapter, item.verse)
                  }
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={item.markKey ? tr('verse.removeHighlight') : tr('verse.bookmarkRemoved')}
                >
                  <Ionicons name="close" size={18} color={artwork.foreground.tertiary} />
                </Pressable>
              </View>
            </ArtSlot>
          </Pressable>
        )}
      />
    </View>
  );
}
