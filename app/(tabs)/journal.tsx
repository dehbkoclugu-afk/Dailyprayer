import React, { useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { PillButton } from '@/components/PillButton';
import { ArtSlot } from '@/components/ArtSlot';
import { useTheme } from '@/hooks/useTheme';
import { type, type as ty } from '@/theme/typography';
import { radius, spacing, TAP_MIN } from '@/theme/tokens';
import { useJournalStore, type JournalEntry } from '@/state/useJournalStore';
import { useStreakStore } from '@/state/useStreakStore';
import { toast } from '@/state/useToastStore';
import { useT, translate } from '@/i18n';

export default function Journal() {
  const t = useTheme();
  const { t: tr, tu } = useT();
  const { prompt } = useLocalSearchParams<{ prompt?: string }>();
  const { entries, add, remove, restore, update } = useJournalStore();
  const completeStep = useStreakStore((s) => s.completeStep);
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  // A single-purpose gratitude journal now. Verses saved from the reader still
  // belong here (they're personal reflections); legacy prayer requests are hidden.
  const shown = entries.filter((e) => e.kind !== 'prayer-request');
  const groups = useMemo(() => Object.entries(
    shown.reduce<Record<string, JournalEntry[]>>((result, entry) => {
      (result[entry.day] ??= []).push(entry);
      return result;
    }, {}),
  ), [shown]);

  useEffect(() => {
    if (prompt) {
      setText(prompt);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [prompt]);

  /**
   * Deleting is not permanent on the first tap. The entry is kept in the closure
   * and the toast offers it back — a gratitude note or a saved verse is exactly the
   * kind of thing a mis-tap should not cost (roadmap item 15).
   */
  const deleteEntry = (entry: JournalEntry) => {
    remove(entry.id);
    Haptics.selectionAsync().catch(() => {});
    toast(translate('journal.deleted'), translate('journal.undo'), () => {
      restore(entry);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    });
  };

  const submit = () => {
    if (!text.trim()) return;
    if (editingId) update(editingId, text);
    else add('gratitude', text);
    completeStep('gratitude');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    toast(translate('toast.gratitudeSaved'));
    setText('');
    setEditingId(null);
  };

  return (
    <Screen tabbed>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={[ty.title, { color: t.ink }]}>{tr('journal.title')}</Text>
      <Text style={[ty.callout, { color: t.inkSoft, marginTop: spacing.xs }]}>{tr('journal.sub')}</Text>

      {/* Composer — one calm card with room to breathe: a serif prompt, a
          borderless field, and the save action, spaced generously. */}
      <View
        style={{
          backgroundColor: t.surface,
          borderRadius: radius.card,
          borderWidth: 1,
          borderColor: t.border,
          padding: spacing.xl,
          marginTop: spacing.xl,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Ionicons name="leaf-outline" size={16} color={t.gold} />
          <Text
            style={{ ...type.overline, letterSpacing: 2,
              color: t.goldText }}
          >
            {tu(tr('journal.gratitude'))}
          </Text>
        </View>

        <Text
          style={{ ...type.quote, lineHeight: 28,
            color: t.ink,
            fontStyle: 'italic',
            marginTop: spacing.md }}
        >
          {tr('journal.promptGratitude')}
        </Text>

        <TextInput
          ref={inputRef}
          value={text}
          onChangeText={setText}
          placeholder={tr('journal.placeholderGratitude')}
          placeholderTextColor={t.inkFaint}
          multiline
          accessibilityLabel={tr('a11y.journalEntry')}
          style={{ ...type.body, marginTop: spacing.lg,
            minHeight: 108,
            lineHeight: 25,
            color: t.ink,
            textAlignVertical: 'top' }}
        />

        <PillButton
          label={tr('journal.save')}
          onPress={submit}
          disabled={!text.trim()}
          style={{ marginTop: spacing.lg }}
        />
      </View>

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
            style={{ ...type.quoteSmall, lineHeight: 24,
              color: t.inkSoft,
              textAlign: 'center',
              maxWidth: 280 }}
          >
            {tr('journal.empty')}
          </Text>
          <PillButton label={tr('journal.gratitude')} onPress={() => inputRef.current?.focus()} style={{ marginTop: spacing.lg }} />
        </View>
      ) : (
        <View style={{ gap: spacing.md }}>
          {groups.map(([day, dayEntries]) => (
            <View key={day} style={{ gap: spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing.sm }}>
              <Text style={{ ...type.calloutSemi, color: t.ink }}>{day}</Text>
              <Text style={{ ...type.label, color: t.inkSoft }}>{dayEntries.length}</Text>
            </View>
          {dayEntries.map((e) => (
            <View
              key={e.id}
              style={{
                backgroundColor: t.surface,
                borderRadius: radius.card,
                borderWidth: 1,
                borderColor: t.border,
                padding: spacing.xl,
              }}
            >
              {e.kind === 'verse' && e.ref ? (
                <Text
                  style={{ ...type.labelSemi, letterSpacing: 1.5,
                    color: t.goldText,
                    marginBottom: spacing.sm }}
                >
                  {tu(e.ref)}
                </Text>
              ) : null}
              <Text
                style={{ ...type.quoteSmall, lineHeight: 26,
                  color: t.ink,
                  fontStyle: e.kind === 'verse' ? 'italic' : 'normal' }}
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
                  <Text style={{ ...type.labelMedium, color: t.inkFaint }}>
                    {e.day}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <Pressable
                  onPress={() => { setEditingId(e.id); setText(e.text); requestAnimationFrame(() => inputRef.current?.focus()); }}
                  accessibilityRole="button"
                  accessibilityLabel={tr('journal.save')}
                  style={{ width: TAP_MIN, height: TAP_MIN, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Ionicons name="create-outline" size={18} color={t.blue} />
                </Pressable>
                <Pressable
                  onPress={() => deleteEntry(e)}
                  accessibilityRole="button"
                  accessibilityLabel={tr('a11y.deleteEntry')}
                  style={({ pressed }) => ({
                    width: TAP_MIN,
                    height: TAP_MIN,
                    borderRadius: TAP_MIN / 2,
                    backgroundColor: t.surfaceAlt,
                    borderWidth: 1,
                    borderColor: pressed ? t.danger : t.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: -spacing.md,
                    opacity: pressed ? 0.72 : 1,
                  })}
                >
                  <Ionicons name="trash-outline" size={18} color={t.danger} />
                </Pressable>
                </View>
              </View>
            </View>
          ))}
            </View>
          ))}
        </View>
      )}
      </KeyboardAvoidingView>
    </Screen>
  );
}
