import React from 'react';
import { Pressable, Share, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { sampleChapters } from '@/data/bible';
import { useBibleStore } from '@/state/useBibleStore';
import { useTheme } from '@/hooks/useTheme';
import { fonts, type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { useT } from '@/i18n';

export default function SavedVerses() {
  const t = useTheme();
  const { t: tr } = useT();
  const savedVerseKeys = useBibleStore((state) => state.savedVerseKeys);
  const toggleSavedVerse = useBibleStore((state) => state.toggleSavedVerse);
  const verses = savedVerseKeys.flatMap((key) => {
    const [book, chapterNumber, verseIndex] = key.split('|');
    const chapter = sampleChapters.find(
      (item) => item.book === book && item.chapter === Number(chapterNumber),
    );
    const text = chapter?.verses[Number(verseIndex)];
    return text
      ? [{ key, text, reference: `${book} ${chapterNumber}:${Number(verseIndex) + 1}` }]
      : [];
  });

  return (
    <Screen>
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel={tr('common.back')}
        style={{ width: 48, height: 48, justifyContent: 'center' }}
      >
        <Ionicons name="chevron-back" size={24} color={t.ink} />
      </Pressable>
      <Text style={[ty.title, { color: t.ink }]}>{tr('bible.savedVerses')}</Text>
      {verses.length === 0 ? (
        <Text style={[ty.body, { color: t.inkSoft, marginTop: spacing.lg }]}>
          {tr('bible.savedEmpty')}
        </Text>
      ) : (
        <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
          {verses.map((verse) => (
            <View
              key={verse.key}
              style={{
                backgroundColor: t.surface,
                borderRadius: radius.inner,
                padding: spacing.lg,
              }}
            >
              <Text style={{ fontFamily: fonts.serifLight, fontSize: 18, lineHeight: 29, color: t.ink }}>
                {verse.text}
              </Text>
              <Text style={{ fontFamily: fonts.sansMedium, fontSize: 13, color: t.inkSoft, marginTop: spacing.sm }}>
                {verse.reference}
              </Text>
              <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm }}>
                <Pressable
                  onPress={() => Share.share({ message: `${verse.text}\n— ${verse.reference}` })}
                  accessibilityRole="button"
                  accessibilityLabel={tr('bible.share')}
                  style={{ minHeight: 48, justifyContent: 'center' }}
                >
                  <Text style={{ fontFamily: fonts.sansMedium, fontSize: 14, color: t.blue }}>
                    {tr('bible.share')}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => toggleSavedVerse(verse.key)}
                  accessibilityRole="button"
                  accessibilityLabel={tr('bible.unsave')}
                  style={{ minHeight: 48, justifyContent: 'center' }}
                >
                  <Text style={{ fontFamily: fonts.sansMedium, fontSize: 14, color: t.inkSoft }}>
                    {tr('bible.unsave')}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}
