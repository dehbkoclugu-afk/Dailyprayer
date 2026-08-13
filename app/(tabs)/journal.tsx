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
import { type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { useJournalStore } from '@/state/useJournalStore';
import { useStreakStore } from '@/state/useStreakStore';
import { toast } from '@/state/useToastStore';
import { useT, translate } from '@/i18n';

export default function Journal() {
  const t = useTheme();
  const artwork = useArtwork();
  const { t: tr } = useT();
  const { entries, add, remove, restore } = useJournalStore();
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

  const removeWithUndo = (entry: (typeof entries)[number]) => {
    remove(entry.id);
    toast(translate('a11y.deleteEntry'), translate('today.undo'), () => restore(entry));
  };

  return (
    <Screen tabbed>
      <Text style={[ty.title, { color: t.ink }]}>{tr('journal.title')}</Text>
      <Text style={[ty.secondary, { color: t.inkSoft, marginTop: spacing.xs }]}>{tr('journal.sub')}</Text>

      {/* Composer , one calm card with room to breathe: a serif prompt, a
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
                ...ty.labelSmall,
                letterSpacing: 2,
                color: t.gold,
              }}
            >
              {tr('journal.gratitude')}
            </Text>
          </View>

          <Text
            style={{
              ...ty.editorialBody,
              color: artwork.foreground.primary,
              fontStyle: 'italic',
              marginTop: spacing.md,
              textShadowColor: 'rgba(0,0,0,0.78)',
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
            accessibilityLabel={tr('a11y.journalEntry')}
            style={{
              marginTop: spacing.lg,
              minHeight: 64,
              flex: 1,
              ...ty.bodyInput,
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
      {shown.length === 0 ? (
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
              ...ty.editorialSecondary,
              color: t.inkSoft,
              flex: 1,
            }}
          >
            {tr('journal.empty')}
          </Text>
        </View>
      ) : (
        <View style={{ gap: spacing.md }}>
          {shown.map((e) => (
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
                      ...ty.labelSmall,
                      letterSpacing: 1.5,
                      color: t.gold,
                      marginBottom: spacing.sm,
                    }}
                  >
                    {e.ref}
                  </Text>
                ) : null}
                <Text
                  style={{
                    ...ty.editorialCompact,
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
                      name={e.kind === 'verse' ? 'bookmark' : 'leaf'}
                      size={13}
                      color={t.inkFaint}
                    />
                    <Text style={{ ...ty.labelSmallMedium, color: t.inkFaint }}>
                      {e.day}
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
                      backgroundColor: pressed ? t.border : t.surfaceAlt,
                      borderWidth: 1,
                      borderColor: t.border,
                    })}
                  >
                    <Ionicons name="trash-outline" size={20} color={t.danger} />
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}
