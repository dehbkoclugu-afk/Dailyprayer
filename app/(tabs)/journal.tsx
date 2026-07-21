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
  const { entries, add, toggleAnswered, remove } = useJournalStore();
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

  return (
    <Screen tabbed>
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
                minHeight: 44,
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
        accessibilityLabel="Journal entry"
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
      {entries.length === 0 ? (
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
          <Text style={{ fontFamily: fonts.sans, fontSize: 14, color: t.inkSoft, textAlign: 'center' }}>
{tr('journal.empty')}
          </Text>
        </View>
      ) : (
        <View style={{ gap: spacing.md }}>
          {entries.map((e) => (
            <View
              key={e.id}
              style={{
                backgroundColor: t.surface,
                borderRadius: radius.inner,
                borderWidth: 1,
                borderColor: e.answered ? t.gold : t.border,
                padding: spacing.lg,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: fonts.sansMedium, fontSize: 12, color: t.inkFaint }}>
                  {e.day} · {tr(e.kind === 'gratitude' ? 'journal.gratitude' : 'journal.request')}
                  {e.answered ? ` · ${tr('journal.answered')}` : ''}
                </Text>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  {e.kind === 'prayer-request' ? (
                    <Pressable
                      onPress={() => toggleAnswered(e.id)}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={e.answered ? 'Mark as not answered' : 'Mark as answered'}
                    >
                      <Ionicons
                        name={e.answered ? 'checkmark-circle' : 'checkmark-circle-outline'}
                        size={20}
                        color={e.answered ? t.gold : t.inkFaint}
                      />
                    </Pressable>
                  ) : null}
                  <Pressable
                    onPress={() => remove(e.id)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Delete entry"
                  >
                    <Ionicons name="trash-outline" size={18} color={t.inkFaint} />
                  </Pressable>
                </View>
              </View>
              <Text style={{ fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: t.ink, marginTop: spacing.sm }}>
                {e.text}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}
