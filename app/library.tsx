import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/typography';
import { radius, spacing, TAP_MIN } from '@/theme/tokens';
import { HIGHLIGHT_ICON, HIGHLIGHT_LABEL, HIGHLIGHT_SWATCH } from '@/theme/highlights';
import { getBible } from '@/data/bibleFull';
import { useBookmarkStore } from '@/state/useBookmarkStore';
import { useHighlightStore } from '@/state/useHighlightStore';
import { useT } from '@/i18n';
import type { TranslationKey } from '@/i18n/translations';

type Tab = 'bookmarks' | 'highlights';

interface Row {
  book: number;
  chapter: number;
  verse: number;
  ref: string;
  preview: string;
  /** The swatch drawn on the row; present only on a highlight. */
  color?: string;
  /** The same colour as something a screen reader can say (roadmap item 26). */
  colorName?: TranslationKey;
  /** …and as a shape, for a reader who sees but cannot tell the hues apart. */
  icon?: (typeof HIGHLIGHT_ICON)[keyof typeof HIGHLIGHT_ICON];
  markKey?: string;
}

export default function Library() {
  const t = useTheme();
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
        colorName: HIGHLIGHT_LABEL[color],
        icon: HIGHLIGHT_ICON[color],
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
          minHeight: TAP_MIN,
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
        <Text style={{ fontFamily: fonts.serif, fontSize: 24, color: t.ink }}>{tr('library.title')}</Text>
      </View>

      {/* segmented control */}
      <View
        style={{
          flexDirection: 'row',
          // The two halves used to meet edge to edge, so a near-miss switched tabs
          // (roadmap item 22). The active segment still reads as a filled pill.
          gap: spacing.sm,
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
            // The colour stripe is the only thing telling two highlights apart,
            // and a screen reader cannot see it (roadmap item 26).
            accessibilityLabel={
              item.colorName
                ? `${item.ref}, ${tr('a11y.highlighted')}, ${tr(item.colorName)}`
                : item.ref
            }
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.md,
              backgroundColor: t.surface,
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: t.border,
              padding: spacing.lg,
              marginBottom: spacing.md,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            {/* A bare colour stripe was the only thing separating a rose
                highlight from a green one (roadmap item 27). The shape carries
                it now, in the same slot a bookmark row already uses for its
                icon — so the two tabs finally look like siblings. */}
            {item.icon ? (
              <Ionicons name={item.icon} size={20} color={item.color} />
            ) : (
              <Ionicons name="bookmark" size={18} color={t.gold} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 14, color: t.gold }}>{item.ref}</Text>
              <Text
                style={{ fontFamily: fonts.serifLight, fontSize: 14, lineHeight: 21, color: t.inkSoft, marginTop: 2 }}
                numberOfLines={2}
              >
                {item.preview}
              </Text>
            </View>
            <Pressable
              onPress={() =>
                item.markKey ? clearMark(item.markKey) : removeBookmark(item.book, item.chapter, item.verse)
              }
              accessibilityRole="button"
              accessibilityLabel={item.markKey ? tr('verse.removeHighlight') : tr('verse.removeBookmark')}
              style={{
                width: TAP_MIN,
                height: TAP_MIN,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="close" size={18} color={t.inkFaint} />
            </Pressable>
          </Pressable>
        )}
      />
    </View>
  );
}
