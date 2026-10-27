import React, { useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { PillButton } from '@/components/PillButton';
import { ArtSlot } from '@/components/ArtSlot';
import { useTheme } from '@/hooks/useTheme';
import { useArtwork } from '@/hooks/useArtwork';
import { fonts, type as ty } from '@/theme/typography';
import { radius, spacing, art } from '@/theme/tokens';
import { useJournalStore } from '@/state/useJournalStore';
import { useStreakStore } from '@/state/useStreakStore';
import { toast } from '@/state/useToastStore';
import { useT, translate } from '@/i18n';

/** Journal days are stored as local YYYY-MM-DD keys; show them in the UI locale. */
function formatEntryDay(day: string, locale: string): string {
  const [y, m, d] = day.split('-').map(Number);
  if (!y || !m || !d) return day;
  try {
    return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(
      new Date(y, m - 1, d),
    );
  } catch {
    return day;
  }
}

/** Longest entry accepted by the composer (keeps backups and lists light). */
const MAX_ENTRY_LENGTH = 2000;

export default function Journal() {
  const t = useTheme();
  const artwork = useArtwork();
  const { t: tr, locale } = useT();
  const entries = useJournalStore((s) => s.entries);
  const add = useJournalStore((s) => s.add);
  const remove = useJournalStore((s) => s.remove);
  const restore = useJournalStore((s) => s.restore);
  const completeStep = useStreakStore((s) => s.completeStep);
  const [text, setText] = useState('');

  // Gratitude, saved verses and (legacy) prayer requests are all the user's
  // own writing — every entry stays visible and deletable.
  const shown = entries;

  const submit = () => {
    if (!text.trim()) return;
    add('gratitude', text);
    completeStep('gratitude');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    toast(translate('toast.gratitudeSaved'));
    setText('');
  };

  const removeWithUndo = (entry: (typeof entries)[number]) => {
    remove(entry.id);
    toast(translate('a11y.deleteEntry'), translate('today.undo'), () => restore(entry));
  };

  return (
    <Screen tabbed scroll={false} style={{ paddingTop: 0, paddingHorizontal: 0, paddingBottom: 0 }}>
      <FlatList
        data={shown}
        keyExtractor={(e) => e.id}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: spacing.xl, paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl }}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListHeaderComponent={
          <View>
            <Text accessibilityRole="header" style={[ty.title, { color: t.ink }]}>{tr('journal.title')}</Text>
            <Text style={[ty.secondary, { color: t.inkSoft, marginTop: spacing.xs }]}>{tr('journal.sub')}</Text>

            {/* Composer — one calm card with room to breathe: a serif prompt, a
                borderless field, and the save action, spaced generously. */}
            <ArtSlot
              id="A22-journal-compose"
              height={310}
              radius={radius.card}
              variant="card"
              style={{
                backgroundColor: t.surface,
                borderRadius: radius.card,
                borderWidth: 1,
                borderColor: t.border,
                marginTop: spacing.xl,
                overflow: 'hidden',
              }}
            >
              <View style={{ flex: 1, padding: spacing.lg }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <Ionicons name="leaf-outline" size={16} color={t.gold} />
                  <Text
                    style={{
                      fontFamily: fonts.sansSemiBold,
                      fontSize: 11,
                      letterSpacing: 2,
                      textTransform: 'uppercase',
                      color: t.gold,
                    }}
                  >
                    {tr('journal.gratitude')}
                  </Text>
                </View>

                <Text
                  style={{
                    fontFamily: fonts.serifLight,
                    fontSize: 18,
                    lineHeight: 26,
                    color: artwork.foreground.primary,
                    fontStyle: 'italic',
                    marginTop: spacing.md,
                    textShadowColor: art.textShadow,
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 6,
                  }}
                >
                  {tr('journal.promptGratitude')}
                </Text>

                <TextInput
                  value={text}
                  onChangeText={setText}
                  placeholder={tr('journal.placeholderGratitude')}
                  placeholderTextColor={artwork.foreground.tertiary}
                  multiline
                  maxLength={MAX_ENTRY_LENGTH}
                  accessibilityLabel={tr('a11y.journalEntry')}
                  style={{
                    marginTop: spacing.lg,
                    minHeight: 64,
                    flex: 1,
                    fontFamily: fonts.sans,
                    fontSize: 16,
                    lineHeight: 25,
                    color: artwork.foreground.primary,
                    textShadowColor: 'rgba(0,0,0,0.72)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 5,
                    textAlignVertical: 'top',
                  }}
                />

                <PillButton
                  label={tr('journal.save')}
                  onPress={submit}
                  disabled={!text.trim()}
                  style={{ marginTop: spacing.sm }}
                />
              </View>
            </ArtSlot>
            <SectionHeader title={tr('journal.entries')} />
          </View>
        }
        ListEmptyComponent={
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.lg,
                backgroundColor: t.surface,
                borderWidth: 1,
                borderColor: t.border,
                borderRadius: radius.card,
                padding: spacing.lg,
              }}
            >
              <ArtSlot
                id="A12-journal-empty"
                height={92}
                fit="contain"
                style={{ width: 92 }}
              />
              <Text
                style={{
                  fontFamily: fonts.serifLight,
                  fontSize: 15,
                  lineHeight: 22,
                  color: t.inkSoft,
                  flex: 1,
                }}
              >
                {tr('journal.empty')}
              </Text>
            </View>
        }
        renderItem={({ item: e }) => (
          <View
            key={e.id}
            style={{
              backgroundColor: t.surface,
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: t.border,
            }}
          >
            <View style={{ padding: spacing.xl }}>
              {e.kind === 'verse' && e.ref ? (
                <Text
                  style={{
                    fontFamily: fonts.sansSemiBold,
                    fontSize: 12,
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    color: t.gold,
                    marginBottom: spacing.sm,
                  }}
                >
                  {e.ref}
                </Text>
              ) : null}
              <Text
                style={{
                  fontFamily: fonts.serifLight,
                  fontSize: 17,
                  lineHeight: 26,
                  color: t.ink,
                  fontStyle: e.kind === 'verse' ? 'italic' : 'normal',
                }}
              >
                {e.text}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: spacing.lg,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons
                    name={e.kind === 'verse' ? 'bookmark' : e.kind === 'prayer-request' ? 'flame' : 'leaf'}
                    size={13}
                    color={t.inkFaint}
                  />
                  <Text style={{ fontFamily: fonts.sansMedium, fontSize: 12, color: t.inkFaint }}>
                    {formatEntryDay(e.day, locale)}
                  </Text>
                </View>
                <Pressable
                  onPress={() => removeWithUndo(e)}
                  accessibilityRole="button"
                  accessibilityLabel={tr('a11y.deleteEntry')}
                  style={({ pressed }) => ({
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: pressed ? t.border : t.surface,
                  })}
                >
                  <Ionicons name="trash-outline" size={18} color={t.inkFaint} />
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />
    </Screen>
  );
}
