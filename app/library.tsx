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
import { findBookIndex, findVerseIndex, parseHighlightKey } from '@/data/bibleNav';
import { truncate } from '@/lib/text';
import { useBookmarkStore, type Bookmark } from '@/state/useBookmarkStore';
import { useHighlightStore } from '@/state/useHighlightStore';
import { toast } from '@/state/useToastStore';
import { useT } from '@/i18n';
import { useScriptureLocale } from '@/i18n/scripture';
import { BackButton } from '@/components/BackButton';

type Tab = 'bookmarks' | 'highlights';

interface Row {
  key: string;
  code: string;
  chapter: number;
  verse: string;
  ref: string;
  preview: string;
  bookmark?: Bookmark;
  color?: string;
  markKey?: string;
}

export default function Library() {
  const t = useTheme();
  const artwork = useArtwork();
  const { t: tr } = useT();
  const scriptureLocale = useScriptureLocale();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('bookmarks');

  const bookmarks = useBookmarkStore((s) => s.bookmarks);
  const removeBookmark = useBookmarkStore((s) => s.remove);
  const restoreBookmark = useBookmarkStore((s) => s.restore);
  const marks = useHighlightStore((s) => s.marks);
  const clearMark = useHighlightStore((s) => s.clear);

  const bookmarkRows = useMemo<Row[]>(
    () =>
      bookmarks.map((m) => ({
        key: `b:${m.code}|${m.chapter}|${m.verse}`,
        code: m.code,
        chapter: m.chapter,
        verse: m.verse,
        ref: m.ref,
        preview: m.preview,
        bookmark: m,
      })),
    [bookmarks],
  );

  // Highlights render from the Scripture edition the reader shows (not the UI
  // language), in canonical order.
  const highlightRows = useMemo<Row[]>(() => {
    const bible = getBible(scriptureLocale);
    const rows: (Row & { order: [number, number, number] })[] = [];
    for (const [key, color] of Object.entries(marks)) {
      const address = parseHighlightKey(key);
      if (!address) continue;
      const b = findBookIndex(bible, address.code);
      if (b < 0) continue;
      const ch = bible[b].chapters[address.chapter];
      const v = findVerseIndex(ch, address.verse);
      if (v < 0) continue;
      const [label, text] = ch[v];
      rows.push({
        key: `h:${key}`,
        code: address.code,
        chapter: address.chapter,
        verse: label,
        ref: `${bible[b].name} ${address.chapter + 1}:${label}`,
        preview: truncate(text, 90),
        color: HIGHLIGHT_SWATCH[color],
        markKey: key,
        order: [b, address.chapter, v],
      });
    }
    return rows.sort(
      (a, b) => a.order[0] - b.order[0] || a.order[1] - b.order[1] || a.order[2] - b.order[2],
    );
  }, [marks, scriptureLocale]);

  const removeRow = (item: Row) => {
    if (item.markKey) {
      const color = marks[item.markKey];
      clearMark(item.markKey);
      toast(tr('toast.highlightOff'), tr('today.undo'), () =>
        useHighlightStore.getState().set(item.markKey as string, color),
      );
      return;
    }
    if (!item.bookmark) return;
    const removed = item.bookmark;
    removeBookmark(removed);
    toast(tr('verse.bookmarkRemoved'), tr('today.undo'), () => restoreBookmark(removed));
  };

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
        <BackButton />
        <Text accessibilityRole="header" style={{ fontFamily: fonts.serif, fontSize: 24, color: t.ink }}>{tr('library.title')}</Text>
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
        keyExtractor={(r) => r.key}
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
                  onPress={() => removeRow(item)}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.markKey ? tr('verse.removeHighlight') : tr('library.removeBookmark')}: ${item.ref}`}
                  style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}
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
