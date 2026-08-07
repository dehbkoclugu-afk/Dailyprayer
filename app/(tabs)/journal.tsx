import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { PillButton } from '@/components/PillButton';
import { ArtSlot } from '@/components/ArtSlot';
import { useTheme } from '@/hooks/useTheme';
import { useArtwork } from '@/hooks/useArtwork';
import { fonts, type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { useJournalStore } from '@/state/useJournalStore';
import { useStreakStore } from '@/state/useStreakStore';
import { toast } from '@/state/useToastStore';
import { useT, translate } from '@/i18n';

export default function Journal() {
  const t = useTheme();
  const artwork = useArtwork();
  const { t: tr } = useT();
  const { entries, add, remove } = useJournalStore();
  const completeStep = useStreakStore((s) => s.completeStep);
  const [text, setText] = useState('');

  // A single-purpose gratitude journal now. Verses saved from the reader still
  // belong here (they're personal reflections); legacy prayer requests are hidden.
  const shown = entries.filter((e) => e.kind !== 'prayer-request');

  const submit = () => {
    if (!text.trim()) return;
    add('gratitude', text);
    completeStep('gratitude');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    toast(translate('toast.gratitudeSaved'));
    setText('');
  };

  return (
    <Screen tabbed>
      <Text style={[ty.title, { color: t.ink }]}>{tr('journal.title')}</Text>
      <Text style={[ty.secondary, { color: t.inkSoft, marginTop: spacing.xs }]}>{tr('journal.sub')}</Text>

      {/* Composer , one calm card with room to breathe: a serif prompt, a
          borderless field, and the save action, spaced generously. */}
      <ArtSlot
        id="A20-ritual-gratitude"
        variant="card"
        radius={radius.card}
        style={{
          backgroundColor: t.surface,
          borderRadius: radius.card,
          borderWidth: 1,
          borderColor: t.border,
          marginTop: spacing.xl,
        }}
      >
        <View style={{ padding: spacing.xl }}>
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
              fontSize: 19,
              lineHeight: 28,
              color: artwork.foreground.primary,
              fontStyle: 'italic',
              marginTop: spacing.md,
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
            accessibilityLabel={tr('a11y.journalEntry')}
            style={{
              marginTop: spacing.lg,
              minHeight: 108,
              fontFamily: fonts.sans,
              fontSize: 16,
              lineHeight: 25,
              color: artwork.foreground.primary,
              textAlignVertical: 'top',
            }}
          />

          <PillButton
            label={tr('journal.save')}
            onPress={submit}
            disabled={!text.trim()}
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </ArtSlot>

      <SectionHeader title={tr('journal.entries')} />
      {shown.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: spacing.xxl }}>
          <ArtSlot
            id="A12-journal-empty"
            height={140}
            fit="contain"
            style={{ width: 140, marginBottom: spacing.lg }}
          />
          <Text
            style={{
              fontFamily: fonts.serifLight,
              fontSize: 16,
              lineHeight: 24,
              color: t.inkSoft,
              textAlign: 'center',
              maxWidth: 280,
            }}
          >
            {tr('journal.empty')}
          </Text>
        </View>
      ) : (
        <View style={{ gap: spacing.md }}>
          {shown.map((e) => (
            <ArtSlot
              key={e.id}
              id={e.kind === 'verse' ? 'A18-ritual-reading' : 'A20-ritual-gratitude'}
              variant="card"
              radius={radius.card}
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
                    color: artwork.foreground.primary,
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
                      name={e.kind === 'verse' ? 'bookmark' : 'leaf'}
                      size={13}
                      color={artwork.foreground.tertiary}
                    />
                    <Text style={{ fontFamily: fonts.sansMedium, fontSize: 12, color: artwork.foreground.tertiary }}>
                      {e.day}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => remove(e.id)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={tr('a11y.deleteEntry')}
                  >
                    <Ionicons name="trash-outline" size={18} color={artwork.foreground.tertiary} />
                  </Pressable>
                </View>
              </View>
            </ArtSlot>
          ))}
        </View>
      )}
    </Screen>
  );
}
