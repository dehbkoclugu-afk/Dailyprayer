import React, { useMemo, useRef, useState } from 'react';
import { Pressable, SectionList, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
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
import { type JournalEntry, useJournalStore } from '@/state/useJournalStore';
import { useStreakStore } from '@/state/useStreakStore';
import { toast } from '@/state/useToastStore';
import { useT, translate } from '@/i18n';
import { groupJournalDays } from '@/lib/dailyExperience';

export default function Journal() {
  const t = useTheme();
  const artwork = useArtwork();
  const { t: tr, locale } = useT();
  const { prompt } = useLocalSearchParams<{ prompt?: string }>();
  const { entries, add, update, remove, restore } = useJournalStore();
  const completeStep = useStreakStore((s) => s.completeStep);
  const inputRef = useRef<TextInput>(null);
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const shown = useMemo(
    () => entries.filter((entry) => entry.kind !== 'prayer-request'),
    [entries],
  );
  const sections = useMemo(
    () => groupJournalDays(shown).map((group) => ({ ...group, data: group.entries })),
    [shown],
  );

  const submit = () => {
    if (!text.trim()) return;
    if (editingId) {
      update(editingId, text);
      setEditingId(null);
    } else {
      add('gratitude', text);
      completeStep('gratitude');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      toast(translate('toast.gratitudeSaved'));
    }
    setText('');
  };

  const beginEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setText(entry.text);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setText('');
  };

  const removeWithUndo = (entry: JournalEntry) => {
    remove(entry.id);
    if (editingId === entry.id) cancelEdit();
    toast(translate('a11y.deleteEntry'), translate('today.undo'), () => restore(entry));
  };

  const composer = (
    <>
      <Text style={[ty.title, { color: t.ink }]}>{tr('journal.title')}</Text>
      <Text style={[ty.secondary, { color: t.inkSoft, marginTop: spacing.xs }]}>{tr('journal.sub')}</Text>

      <ArtSlot
        id="A22-journal-compose"
        height={310}
        radius={radius.card}
        variant="card"
        style={{
          backgroundColor: t.surface,
          borderRadius: radius.card,
          borderWidth: 1,
          borderColor: editingId ? t.gold : t.border,
          marginTop: spacing.xl,
          overflow: 'hidden',
        }}
      >
        <View style={{ flex: 1, padding: spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Ionicons name={editingId ? 'create-outline' : prompt === 'devotional' ? 'book-outline' : 'leaf-outline'} size={16} color={t.gold} />
            <Text style={{ ...ty.labelSmall, letterSpacing: 2, color: t.gold, flex: 1 }}>
              {prompt === 'devotional' ? tr('devotional.label') : tr('journal.gratitude')}
            </Text>
            {editingId ? (
              <Pressable
                onPress={cancelEdit}
                accessibilityRole="button"
                accessibilityLabel={tr('profile.cancel')}
                style={({ pressed }) => ({ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? artwork.foreground.badge : 'transparent' })}
              >
                <Ionicons name="close" size={20} color={artwork.foreground.primary} />
              </Pressable>
            ) : null}
          </View>

          <Text style={{ ...ty.editorialBody, color: artwork.foreground.primary, fontStyle: 'italic', marginTop: spacing.md, textShadowColor: 'rgba(0,0,0,0.78)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 }}>
            {tr('journal.promptGratitude')}
          </Text>

          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={setText}
            placeholder={tr('journal.placeholderGratitude')}
            placeholderTextColor={artwork.foreground.tertiary}
            multiline
            accessibilityLabel={tr('a11y.journalEntry')}
            style={{ marginTop: spacing.lg, minHeight: 64, flex: 1, ...ty.bodyInput, color: artwork.foreground.primary, textShadowColor: 'rgba(0,0,0,0.72)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 5, textAlignVertical: 'top' }}
          />

          <PillButton label={tr('journal.save')} onPress={submit} disabled={!text.trim()} style={{ marginTop: spacing.sm }} />
        </View>
      </ArtSlot>

      <SectionHeader title={`${tr('journal.entries')} · ${new Intl.NumberFormat(locale).format(shown.length)}`} />
    </>
  );

  const renderEntry = ({ item }: { item: JournalEntry }) => (
    <View style={{ backgroundColor: t.surface, borderRadius: radius.card, borderWidth: 1, borderColor: editingId === item.id ? t.gold : t.border, marginBottom: spacing.md }}>
      <View style={{ padding: spacing.xl }}>
        {item.kind === 'verse' && item.ref ? (
          <Text style={{ ...ty.labelSmall, letterSpacing: 1.5, color: t.gold, marginBottom: spacing.sm }}>{item.ref}</Text>
        ) : null}
        <Text style={{ ...ty.editorialCompact, color: t.ink, fontStyle: item.kind === 'verse' ? 'italic' : 'normal' }}>{item.text}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name={item.kind === 'verse' ? 'bookmark' : 'leaf'} size={13} color={t.inkFaint} />
            <Text style={{ ...ty.labelSmallMedium, color: t.inkFaint }}>
              {new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(new Date(item.createdAt))}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {item.kind !== 'verse' ? (
              <Pressable
                onPress={() => beginEdit(item)}
                accessibilityRole="button"
                accessibilityLabel={`${tr('a11y.journalEntry')} · ${tr('journal.save')}`}
                style={({ pressed }) => ({ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? t.border : t.surfaceAlt, borderWidth: 1, borderColor: t.border })}
              >
                <Ionicons name="create-outline" size={20} color={t.blue} />
              </Pressable>
            ) : null}
            <Pressable
              onPress={() => removeWithUndo(item)}
              accessibilityRole="button"
              accessibilityLabel={tr('a11y.deleteEntry')}
              style={({ pressed }) => ({ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? t.border : t.surfaceAlt, borderWidth: 1, borderColor: t.border })}
            >
              <Ionicons name="trash-outline" size={20} color={t.danger} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <Screen tabbed scroll={false} style={{ paddingHorizontal: 0, paddingTop: 0 }}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderEntry}
        stickySectionHeadersEnabled
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.xxxl }}
        ListHeaderComponent={composer}
        ListEmptyComponent={(
          <View style={{ alignItems: 'center', gap: spacing.lg, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: radius.card, padding: spacing.xl }}>
            <ArtSlot id="A12-journal-empty" height={116} fit="contain" style={{ width: 116 }} />
            <Text style={{ ...ty.editorialSecondary, color: t.inkSoft, textAlign: 'center' }}>{tr('journal.empty')}</Text>
            <PillButton label={tr('journal.gratitude')} onPress={() => inputRef.current?.focus()} style={{ width: '100%' }} />
          </View>
        )}
        renderSectionHeader={({ section }) => {
          const date = new Date(`${section.day}T12:00:00`);
          return (
            <View style={{ backgroundColor: t.bg, paddingTop: section.startsMonth ? spacing.xl : spacing.sm, paddingBottom: spacing.sm }}>
              {section.startsMonth ? (
                <Text style={{ ...ty.titleCompact, color: t.ink, marginBottom: spacing.sm }}>
                  {new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date)}
                </Text>
              ) : null}
              <Text style={{ ...ty.labelMedium, color: t.gold }}>
                {new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric' }).format(date)} · {section.entries.length}
              </Text>
            </View>
          );
        }}
      />
    </Screen>
  );
}
