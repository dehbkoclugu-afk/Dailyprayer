import React, { useState } from 'react';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { fullBible } from '@/data/bibleFull';
import { useReaderStore } from '@/state/useReaderStore';
import { useHighlightStore } from '@/state/useHighlightStore';
import { useT } from '@/i18n';

export default function Read() {
  const t = useTheme();
  const { t: tr } = useT();
  const insets = useSafeAreaInsets();
  const { book, chapter, setPos } = useReaderStore();
  const { keys: highlightKeys, toggle: toggleHighlight } = useHighlightStore();
  // picker: null = closed, 'books' = book list, number = chapter grid for that book
  const [picker, setPicker] = useState<null | 'books' | number>(null);

  const bIdx = Math.min(book, fullBible.length - 1);
  const bk = fullBible[bIdx];
  const cIdx = Math.min(chapter, bk.chapters.length - 1);
  const verses = bk.chapters[cIdx];

  const go = (b: number, c: number) => {
    setPos(b, c);
    setPicker(null);
  };
  const next = () => {
    if (cIdx + 1 < bk.chapters.length) go(bIdx, cIdx + 1);
    else if (bIdx + 1 < fullBible.length) go(bIdx + 1, 0);
  };
  const prev = () => {
    if (cIdx > 0) go(bIdx, cIdx - 1);
    else if (bIdx > 0) go(bIdx - 1, fullBible[bIdx - 1].chapters.length - 1);
  };
  const hasNext = cIdx + 1 < bk.chapters.length || bIdx + 1 < fullBible.length;
  const hasPrev = cIdx > 0 || bIdx > 0;

  const navBtn = (dir: 'prev' | 'next', enabled: boolean, onPress: () => void, label: string) => (
    <Pressable
      onPress={enabled ? onPress : undefined}
      disabled={!enabled}
      accessibilityRole="button"
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: t.surface,
        borderWidth: 1,
        borderColor: t.border,
        borderRadius: radius.pill,
        paddingVertical: 12,
        opacity: enabled ? 1 : 0.4,
      }}
    >
      {dir === 'prev' ? <Ionicons name="chevron-back" size={16} color={t.inkSoft} /> : null}
      <Text style={{ fontFamily: fonts.sansMedium, fontSize: 14, color: t.inkSoft }}>{label}</Text>
      {dir === 'next' ? <Ionicons name="chevron-forward" size={16} color={t.inkSoft} /> : null}
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: insets.top + spacing.md }}>
      {/* header */}
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
          <Ionicons name="chevron-back" size={24} color={t.inkSoft} />
        </Pressable>
        <Pressable
          onPress={() => setPicker('books')}
          accessibilityRole="button"
          style={({ pressed }) => ({
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: t.surface,
            borderWidth: 1,
            borderColor: t.border,
            borderRadius: radius.pill,
            paddingHorizontal: spacing.lg,
            height: 44,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 16, color: t.ink }}>
            {bk.name} {cIdx + 1}
          </Text>
          <Ionicons name="chevron-down" size={18} color={t.inkFaint} />
        </Pressable>
      </View>

      <FlatList
        key={`${bIdx}-${cIdx}`}
        data={verses}
        keyExtractor={(_, i) => String(i)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.lg,
          paddingBottom: insets.bottom + spacing.xl,
          maxWidth: 480,
          width: '100%',
          alignSelf: 'center',
        }}
        renderItem={({ item, index }) => {
          const hKey = `${bk.code}|${cIdx}|${index}`;
          const highlighted = highlightKeys.includes(hKey);
          return (
            <Text
              onPress={() => {
                const on = toggleHighlight(hKey);
                void on;
              }}
              suppressHighlighting
              style={{
                fontFamily: fonts.serifLight,
                fontSize: 18,
                lineHeight: 30,
                color: t.ink,
                marginBottom: spacing.sm,
                backgroundColor: highlighted ? t.goldSoft : 'transparent',
              }}
            >
              <Text style={{ fontFamily: fonts.sansBold, fontSize: 11, color: t.gold }}>
                {item[0]}
                {'  '}
              </Text>
              {item[1]}
            </Text>
          );
        }}
        ListFooterComponent={
          <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl }}>
            {navBtn('prev', hasPrev, prev, tr('read.prev'))}
            {navBtn('next', hasNext, next, tr('read.next'))}
          </View>
        }
      />

      {/* book / chapter picker */}
      <Modal
        visible={picker !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setPicker(null)}
        statusBarTranslucent
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(6,8,16,0.6)' }}>
          <Pressable style={{ flex: 1 }} onPress={() => setPicker(null)} />
          <View
            style={{
              maxHeight: '72%',
              backgroundColor: t.surface,
              borderTopLeftRadius: radius.card,
              borderTopRightRadius: radius.card,
              borderWidth: 1,
              borderBottomWidth: 0,
              borderColor: t.border,
              paddingTop: spacing.md,
              paddingBottom: insets.bottom + spacing.lg,
            }}
          >
            <View
              style={{
                alignSelf: 'center',
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: t.border,
                marginBottom: spacing.md,
              }}
            />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                paddingHorizontal: spacing.lg,
                marginBottom: spacing.sm,
              }}
            >
              {typeof picker === 'number' ? (
                <Pressable onPress={() => setPicker('books')} hitSlop={8} accessibilityRole="button">
                  <Ionicons name="chevron-back" size={22} color={t.inkSoft} />
                </Pressable>
              ) : null}
              <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 16, color: t.ink }}>
                {typeof picker === 'number' ? fullBible[picker].name : tr('read.pickBook')}
              </Text>
            </View>

            {picker === 'books' ? (
              <FlatList
                data={fullBible}
                keyExtractor={(b) => b.code}
                contentContainerStyle={{ paddingHorizontal: spacing.lg }}
                renderItem={({ item, index }) => (
                  <Pressable
                    onPress={() => setPicker(index)}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: 14,
                      borderTopWidth: index === 0 ? 0 : 1,
                      borderTopColor: t.border,
                      opacity: pressed ? 0.6 : 1,
                    })}
                  >
                    <Text
                      style={{
                        fontFamily: index === bIdx ? fonts.sansSemiBold : fonts.sans,
                        fontSize: 16,
                        color: index === bIdx ? t.gold : t.ink,
                      }}
                    >
                      {item.name}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={t.inkFaint} />
                  </Pressable>
                )}
              />
            ) : typeof picker === 'number' ? (
              <FlatList
                key="chapters"
                data={fullBible[picker].chapters}
                keyExtractor={(_, i) => String(i)}
                numColumns={5}
                contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}
                columnWrapperStyle={{ gap: spacing.sm }}
                renderItem={({ index }) => {
                  const active = picker === bIdx && index === cIdx;
                  return (
                    <Pressable
                      onPress={() => go(picker as number, index)}
                      style={{
                        flex: 1,
                        aspectRatio: 1,
                        maxWidth: 64,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: active ? t.goldSoft : t.surfaceAlt,
                        borderWidth: 1,
                        borderColor: active ? t.gold : t.border,
                        borderRadius: radius.inner,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: fonts.sansMedium,
                          fontSize: 15,
                          color: active ? t.gold : t.ink,
                          fontVariant: ['tabular-nums'],
                        }}
                      >
                        {index + 1}
                      </Text>
                    </Pressable>
                  );
                }}
              />
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}
