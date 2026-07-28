import React from 'react';
import { Modal, Pressable, Share, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type } from '@/theme/typography';
import { radius, spacing, TAP_MIN } from '@/theme/tokens';
import { useReaderTheme } from '@/theme/reading';
import {
  HIGHLIGHT_ICON,
  HIGHLIGHT_LABEL,
  HIGHLIGHT_ORDER,
  HIGHLIGHT_SWATCH,
  type HighlightColor,
} from '@/theme/highlights';
import { useHighlightStore } from '@/state/useHighlightStore';
import { useBookmarkStore } from '@/state/useBookmarkStore';
import { useJournalStore } from '@/state/useJournalStore';
import { toast } from '@/state/useToastStore';
import { useT } from '@/i18n';
import { getBibleCredit } from '@/data/bibleFull';
import { useSheetTitleFocus } from '@/a11y/sheetFocus';

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
  const t = useReaderTheme();
  const { t: tr, locale } = useT();
  const insets = useSafeAreaInsets();

  const marks = useHighlightStore((s) => s.marks);
  const setMark = useHighlightStore((s) => s.set);
  const clearMark = useHighlightStore((s) => s.clear);
  const bookmarks = useBookmarkStore((s) => s.bookmarks);
  const toggleBookmark = useBookmarkStore((s) => s.toggle);
  const addJournal = useJournalStore((s) => s.add);
  // Above the early return: a hook cannot run conditionally. The sheet renders
  // only when there is a verse, so that is also when it is visible.
  const titleRef = useSheetTitleFocus(verse != null);

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

  // Verbatim text, its reference, then the edition credit. The credit is not
  // decoration: YTC (CC BY-ND 4.0) and Bíblia Livre (CC BY 4.0) both require the
  // copyright and source information to travel with any extract, and the WEB
  // trademark condition requires identifying unchanged text.
  const payload = `“${verse.text}”\n— ${verse.ref}\n${getBibleCredit(locale)}`;

  const onCopy = async () => {
    tap();
    await Clipboard.setStringAsync(payload).catch(() => {});
    toast(tr('verse.copied'));
    onClose();
  };

  const onShare = () => {
    Share.share({ message: payload }).catch(() => {});
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
      accessibilityState={{ selected: active }}
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
      <Text style={{ ...type.labelMedium, color: active ? t.gold : t.inkSoft }}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      {/* iOS needs telling that the sheet is modal; on Android the Modal is a
          separate window and TalkBack cannot reach behind it anyway. */}
      <View style={{ flex: 1, backgroundColor: 'rgba(6,8,16,0.6)' }} accessibilityViewIsModal>
        <Pressable
          style={{ flex: 1 }}
          onPress={onClose}
          importantForAccessibility="no"
          accessibilityElementsHidden
        />
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
          <Text
            ref={titleRef}
            accessibilityRole="header"
            style={{ ...type.labelSemi, letterSpacing: 1.5, textTransform: 'uppercase', color: t.gold }}
          >
            {verse.ref}
          </Text>
          <Text
            style={{ ...type.quoteSmall, lineHeight: 26, color: t.ink, marginTop: spacing.xs }}
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
                  // `${tr('verse.highlight')} ${c}` read out the storage key —
                  // "Vurgula gold" — in every language (roadmap item 26).
                  accessibilityLabel={`${tr('verse.highlight')}, ${tr(HIGHLIGHT_LABEL[c])}`}
                  accessibilityState={{ selected: on }}
                  hitSlop={6}
                  style={{
                    width: TAP_MIN,
                    height: TAP_MIN,
                    borderRadius: TAP_MIN / 2,
                    backgroundColor: HIGHLIGHT_SWATCH[c],
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: on ? 3 : 0,
                    borderColor: t.ink,
                  }}
                >
                  {/* The shape is what distinguishes the four without colour
                      vision; filled vs outline is the second channel for which
                      one is chosen (roadmap item 27). */}
                  <Ionicons
                    name={on ? HIGHLIGHT_ICON[c] : `${HIGHLIGHT_ICON[c]}-outline`}
                    size={20}
                    color={t.onGold}
                  />
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
                  width: TAP_MIN,
                  height: TAP_MIN,
                  borderRadius: TAP_MIN / 2,
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
