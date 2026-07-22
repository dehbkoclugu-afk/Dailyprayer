import React from 'react';
import { Modal, Pressable, Share, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import {
  HIGHLIGHT_ORDER,
  HIGHLIGHT_SWATCH,
  type HighlightColor,
} from '@/theme/highlights';
import { useHighlightStore } from '@/state/useHighlightStore';
import { useBookmarkStore } from '@/state/useBookmarkStore';
import { useJournalStore } from '@/state/useJournalStore';
import { toast } from '@/state/useToastStore';
import { useT } from '@/i18n';

export interface SelectedVerse {
  book: number;
  chapter: number;
  verse: number;
  code: string;
  ref: string;
  text: string;
}

const preview = (s: string, n = 120) => (s.length > n ? `${s.slice(0, n).trimEnd()}…` : s);

export function VerseActionSheet({
  verse,
  onClose,
}: {
  verse: SelectedVerse | null;
  onClose: () => void;
}) {
  const t = useTheme();
  const { t: tr } = useT();
  const insets = useSafeAreaInsets();

  const marks = useHighlightStore((s) => s.marks);
  const setMark = useHighlightStore((s) => s.set);
  const clearMark = useHighlightStore((s) => s.clear);
  const bookmarks = useBookmarkStore((s) => s.bookmarks);
  const toggleBookmark = useBookmarkStore((s) => s.toggle);
  const addJournal = useJournalStore((s) => s.add);

  if (!verse) return null;

  const hKey = `${verse.code}|${verse.chapter}|${verse.verse}`;
  const activeColor = marks[hKey];
  const bookmarked = bookmarks.some(
    (m) => m.book === verse.book && m.chapter === verse.chapter && m.verse === verse.verse,
  );

  const tap = () => Haptics.selectionAsync().catch(() => {});

  const pickColor = (c: HighlightColor) => {
    tap();
    if (activeColor === c) clearMark(hKey);
    else setMark(hKey, c);
  };

  const onBookmark = () => {
    tap();
    const on = toggleBookmark({
      book: verse.book,
      chapter: verse.chapter,
      verse: verse.verse,
      ref: verse.ref,
      preview: preview(verse.text, 90),
    });
    toast(on ? tr('verse.bookmarkAdded') : tr('verse.bookmarkRemoved'));
  };

  const onCopy = async () => {
    tap();
    await Clipboard.setStringAsync(`“${verse.text}”\n— ${verse.ref}`).catch(() => {});
    toast(tr('verse.copied'));
    onClose();
  };

  const onShare = () => {
    Share.share({ message: `“${verse.text}”\n— ${verse.ref}` }).catch(() => {});
    onClose();
  };

  const onSaveJournal = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    addJournal('verse', verse.text, verse.ref);
    toast(tr('verse.saved'));
    onClose();
  };

  const action = (icon: keyof typeof Ionicons.glyphMap, label: string, onPress: () => void, active = false) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        flex: 1,
        alignItems: 'center',
        gap: 6,
        paddingVertical: spacing.md,
        borderRadius: radius.inner,
        backgroundColor: active ? t.goldSoft : t.surfaceAlt,
        borderWidth: 1,
        borderColor: active ? t.gold : t.border,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Ionicons name={icon} size={22} color={active ? t.gold : t.inkSoft} />
      <Text style={{ fontFamily: fonts.sansMedium, fontSize: 12, color: active ? t.gold : t.inkSoft }}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: 'rgba(6,8,16,0.6)' }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel={tr('a11y.close')} />
        <View
          style={{
            backgroundColor: t.surface,
            borderTopLeftRadius: radius.card,
            borderTopRightRadius: radius.card,
            borderWidth: 1,
            borderBottomWidth: 0,
            borderColor: t.border,
            paddingTop: spacing.md,
            paddingHorizontal: spacing.xl,
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
              marginBottom: spacing.lg,
            }}
          />

          {/* the verse itself, so the actions have a subject */}
          <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', color: t.gold }}>
            {verse.ref}
          </Text>
          <Text
            style={{ fontFamily: fonts.serifLight, fontSize: 17, lineHeight: 26, color: t.ink, marginTop: spacing.xs }}
          >
            {preview(verse.text, 160)}
          </Text>

          {/* highlight colors */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.lg }}>
            {HIGHLIGHT_ORDER.map((c) => {
              const on = activeColor === c;
              return (
                <Pressable
                  key={c}
                  onPress={() => pickColor(c)}
                  accessibilityRole="button"
                  accessibilityLabel={`${tr('verse.highlight')} ${c}`}
                  accessibilityState={{ selected: on }}
                  hitSlop={6}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: HIGHLIGHT_SWATCH[c],
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: on ? 3 : 0,
                    borderColor: t.ink,
                  }}
                >
                  {on ? <Ionicons name="checkmark" size={20} color={t.onGold} /> : null}
                </Pressable>
              );
            })}
            {activeColor ? (
              <Pressable
                onPress={() => {
                  tap();
                  clearMark(hKey);
                }}
                accessibilityRole="button"
                accessibilityLabel={tr('verse.removeHighlight')}
                hitSlop={6}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: t.border,
                }}
              >
                <Ionicons name="close" size={20} color={t.inkSoft} />
              </Pressable>
            ) : null}
          </View>

          {/* actions */}
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
            {action('bookmark', bookmarked ? tr('verse.bookmarked') : tr('verse.bookmark'), onBookmark, bookmarked)}
            {action('copy-outline', tr('verse.copy'), onCopy)}
            {action('share-outline', tr('verse.share'), onShare)}
            {action('create-outline', tr('verse.saveJournal'), onSaveJournal)}
          </View>
        </View>
      </View>
    </Modal>
  );
}
