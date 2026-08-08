import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { PillButton } from '@/components/PillButton';
import { ArtSlot } from '@/components/ArtSlot';
import { useTheme } from '@/hooks/useTheme';
import { fonts, type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { useJournalStore } from '@/state/useJournalStore';
import { useStreakStore } from '@/state/useStreakStore';
import { toast } from '@/state/useToastStore';
import { useT, translate } from '@/i18n';

export default function Journal() {
  const t = useTheme();
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
              color: t.ink,
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
            placeholderTextColor={t.inkFaint}
            multiline
            accessibilityLabel={tr('a11y.journalEntry')}
            style={{
              marginTop: spacing.lg,
              minHeight: 64,
              flex: 1,
              fontFamily: fonts.sans,
              fontSize: 16,
              lineHeight: 25,
              color: t.ink,
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
                      name={e.kind === 'verse' ? 'bookmark' : 'leaf'}
                      size={13}
                      color={t.inkFaint}
                    />
                    <Text style={{ fontFamily: fonts.sansMedium, fontSize: 12, color: t.inkFaint }}>
                      {e.day}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => remove(e.id)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={tr('a11y.deleteEntry')}
                  >
                    <Ionicons name="trash-outline" size={18} color={t.inkFaint} />
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
