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

  const kinds = [
    { k: 'gratitude', label: tr('journal.gratitude'), icon: 'heart' },
    { k: 'prayer-request', label: tr('journal.request'), icon: 'flame' },
  ] as const;

  return (
    <Screen tabbed>
      <Text style={[ty.title, { color: t.ink }]}>{tr('journal.title')}</Text>
      <Text style={[ty.secondary, { color: t.inkSoft, marginTop: spacing.xs }]}>{tr('journal.sub')}</Text>

      {/* One composer card — a segmented mode switch, a quiet serif prompt, the
          writing field and the save action, grouped instead of loose blocks. */}
      <View
        style={{
          backgroundColor: t.surface,
          borderRadius: radius.card,
          borderWidth: 1,
          borderColor: t.border,
          padding: spacing.md,
          marginTop: spacing.lg,
        }}
      >
        {/* segmented mode switch */}
        <View style={{ flexDirection: 'row', backgroundColor: t.bg, borderRadius: radius.pill, padding: 4 }}>
          {kinds.map(({ k, label, icon }) => {
            const active = kind === k;
            return (
              <Pressable
                key={k}
                onPress={() => setKind(k)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  paddingVertical: 9,
                  borderRadius: radius.pill,
                  backgroundColor: active ? t.gold : 'transparent',
                }}
              >
                <Ionicons name={icon} size={15} color={active ? t.onGold : t.inkSoft} />
                <Text
                  style={{
                    fontFamily: fonts.sansSemiBold,
                    fontSize: 14,
                    color: active ? t.onGold : t.inkSoft,
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* prompt — a gentle serif line, not a boxed callout */}
        <Text
          style={{
            fontFamily: fonts.serifLight,
            fontSize: 16,
            lineHeight: 24,
            color: t.inkSoft,
            fontStyle: 'italic',
            marginTop: spacing.lg,
            marginHorizontal: spacing.xs,
          }}
        >
          {tr(kind === 'gratitude' ? 'journal.promptGratitude' : 'journal.promptRequest')}
        </Text>

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={tr(kind === 'gratitude' ? 'journal.placeholderGratitude' : 'journal.placeholderRequest')}
          placeholderTextColor={t.inkFaint}
          multiline
          accessibilityLabel={tr('a11y.journalEntry')}
          style={{
            marginTop: spacing.md,
            minHeight: 96,
            paddingHorizontal: spacing.xs,
            fontFamily: fonts.sans,
            fontSize: 16,
            lineHeight: 24,
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

      <SectionHeader title={tr('journal.entries')} />
      {entries.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
          <ArtSlot
            id="A12-journal-empty"
            height={132}
            fit="contain"
            style={{ width: 132, marginBottom: spacing.lg }}
          />
          <Text
            style={{
              fontFamily: fonts.serifLight,
              fontSize: 15,
              lineHeight: 22,
              color: t.inkSoft,
              textAlign: 'center',
              maxWidth: 260,
            }}
          >
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
                borderRadius: radius.card,
                borderWidth: 1,
                borderColor: e.answered ? t.gold : t.border,
                padding: spacing.lg,
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.serifLight,
                  fontSize: 16,
                  lineHeight: 24,
                  color: t.ink,
                }}
              >
                {e.text}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: spacing.md,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons
                    name={e.kind === 'gratitude' ? 'heart' : 'flame'}
                    size={13}
                    color={e.answered ? t.gold : t.inkFaint}
                  />
                  <Text style={{ fontFamily: fonts.sansMedium, fontSize: 12, color: t.inkFaint }}>
                    {e.day}
                    {e.answered ? ` · ${tr('journal.answered')}` : ''}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: spacing.lg }}>
                  {e.kind === 'prayer-request' ? (
                    <Pressable
                      onPress={() => toggleAnswered(e.id)}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={e.answered ? tr('a11y.markUnanswered') : tr('a11y.markAnswered')}
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
