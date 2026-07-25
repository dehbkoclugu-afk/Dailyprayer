import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
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
  const { entries, add, toggleAnswered, remove, restore } = useJournalStore();
  const completeStep = useStreakStore((s) => s.completeStep);
  const [text, setText] = useState('');
  const [kind, setKind] = useState<'gratitude' | 'prayer-request'>('gratitude');

  const submit = () => {
    if (!text.trim()) return;
    add(kind, text);
    if (kind === 'gratitude') completeStep('gratitude');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    toast(translate(kind === 'gratitude' ? 'toast.gratitudeSaved' : 'toast.requestSaved'));
    setText('');
  };

  const confirmRemove = (id: string) => {
    const entry = entries.find((item) => item.id === id);
    if (!entry) return;
    Alert.alert(tr('journal.deleteTitle'), tr('journal.deleteBody'), [
      { text: tr('common.cancel'), style: 'cancel' },
      {
        text: tr('common.delete'),
        style: 'destructive',
        onPress: () => {
          remove(id);
          toast(tr('journal.deleted'), tr('common.undo'), () => restore(entry));
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
    <Screen tabbed scroll={false}>
      <Text style={[ty.title, { color: t.ink }]}>{tr('journal.title')}</Text>
      <Text style={[ty.secondary, { color: t.inkSoft, marginTop: spacing.xs }]}>
{tr('journal.sub')}
      </Text>

      {/* kind toggle */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
        {(
          [
            { k: 'gratitude', label: tr('journal.gratitude'), icon: 'heart-outline' },
            { k: 'prayer-request', label: tr('journal.request'), icon: 'flame-outline' },
          ] as const
        ).map(({ k, label, icon }) => {
          const active = kind === k;
          return (
            <Pressable
              key={k}
              onPress={() => setKind(k)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: active ? t.goldSoft : t.surface,
                borderColor: active ? t.gold : t.border,
                borderWidth: 1,
                borderRadius: radius.pill,
                paddingHorizontal: spacing.lg,
                minHeight: 48,
              }}
            >
              <Ionicons name={icon} size={16} color={active ? t.gold : t.inkSoft} />
              <Text style={{ fontFamily: fonts.sansMedium, fontSize: 14, color: active ? t.gold : t.inkSoft }}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* prompt of the day */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          backgroundColor: t.goldSoft,
          borderRadius: radius.inner,
          padding: spacing.md,
          marginTop: spacing.lg,
        }}
      >
        <Ionicons name="sparkles-outline" size={16} color={t.gold} />
        <Text style={{ fontFamily: fonts.sansMedium, fontSize: 14, color: t.ink, flex: 1 }}>
          {tr(kind === 'gratitude' ? 'journal.promptGratitude' : 'journal.promptRequest')}
        </Text>
      </View>

      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={
tr(kind === 'gratitude' ? 'journal.placeholderGratitude' : 'journal.placeholderRequest')
        }
        placeholderTextColor={t.inkFaint}
        multiline
        accessibilityLabel={tr('journal.entryLabel')}
        style={{
          marginTop: spacing.lg,
          backgroundColor: t.surface,
          borderRadius: radius.inner,
          borderWidth: 1,
          borderColor: t.border,
          padding: spacing.lg,
          minHeight: 96,
          fontFamily: fonts.sans,
          fontSize: 16,
          color: t.ink,
          textAlignVertical: 'top',
        }}
      />
      <PillButton label={tr('journal.save')} onPress={submit} disabled={!text.trim()} style={{ marginTop: spacing.md }} />

      <SectionHeader title={tr('journal.entries')} />
      <FlatList
        data={entries}
        keyExtractor={(entry) => entry.id}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.md, flexGrow: 1, paddingBottom: spacing.xl }}
        ListEmptyComponent={
          <View
            style={{
              backgroundColor: t.surface,
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: t.border,
              padding: spacing.xl,
              alignItems: 'center',
            }}
          >
            <ArtSlot
              id="A12-journal-empty"
              height={120}
              fit="contain"
              style={{ width: 120, marginBottom: spacing.md }}
            />
            <Text
              style={{
                fontFamily: fonts.sans,
                fontSize: 14,
                color: t.inkSoft,
                textAlign: 'center',
              }}
            >
              {tr('journal.empty')}
            </Text>
          </View>
        }
        renderItem={({ item: entry }) => (
          <View
            style={{
              backgroundColor: t.surface,
              borderRadius: radius.inner,
              borderWidth: 1,
              borderColor: entry.answered ? t.success : t.border,
              padding: spacing.lg,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text style={{ flex: 1, fontFamily: fonts.sansMedium, fontSize: 13, color: t.inkSoft }}>
                {entry.day} · {tr(entry.kind === 'gratitude' ? 'journal.gratitude' : 'journal.request')}
                {entry.answered ? ` · ${tr('journal.answered')}` : ''}
              </Text>
              <View style={{ flexDirection: 'row' }}>
                {entry.kind === 'prayer-request' ? (
                  <Pressable
                    onPress={() => toggleAnswered(entry.id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: Boolean(entry.answered) }}
                    accessibilityLabel={
                      entry.answered ? tr('journal.markUnanswered') : tr('journal.markAnswered')
                    }
                    style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Ionicons
                      name={entry.answered ? 'checkmark-circle' : 'checkmark-circle-outline'}
                      size={22}
                      color={entry.answered ? t.success : t.inkFaint}
                    />
                  </Pressable>
                ) : null}
                <Pressable
                  onPress={() => confirmRemove(entry.id)}
                  accessibilityRole="button"
                  accessibilityLabel={tr('journal.deleteEntry')}
                  style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Ionicons name="trash-outline" size={20} color={t.inkFaint} />
                </Pressable>
              </View>
            </View>
            <Text
              style={{
                fontFamily: fonts.sans,
                fontSize: 15,
                lineHeight: 22,
                color: t.ink,
                marginTop: spacing.sm,
              }}
            >
              {entry.text}
            </Text>
          </View>
        )}
      />
    </Screen>
    </KeyboardAvoidingView>
  );
}
