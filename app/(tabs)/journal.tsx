import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { PillButton } from '@/components/PillButton';
import { useTheme } from '@/hooks/useTheme';
import { fonts, type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { useJournalStore } from '@/state/useJournalStore';
import { useStreakStore } from '@/state/useStreakStore';

export default function Journal() {
  const t = useTheme();
  const { entries, add, toggleAnswered, remove } = useJournalStore();
  const completeStep = useStreakStore((s) => s.completeStep);
  const [text, setText] = useState('');
  const [kind, setKind] = useState<'gratitude' | 'prayer-request'>('gratitude');

  const submit = () => {
    if (!text.trim()) return;
    add(kind, text);
    if (kind === 'gratitude') completeStep('gratitude');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setText('');
  };

  return (
    <Screen tabbed>
      <Text style={[ty.title, { color: t.ink }]}>Journal</Text>
      <Text style={[ty.secondary, { color: t.inkSoft, marginTop: spacing.xs }]}>
        Gratitude and prayer requests, kept between you and God
      </Text>

      {/* kind toggle */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
        {(
          [
            { k: 'gratitude', label: 'Gratitude', icon: 'heart-outline' },
            { k: 'prayer-request', label: 'Prayer request', icon: 'flame-outline' },
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

      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={
          kind === 'gratitude' ? 'Today I’m thankful for…' : 'Lord, I bring You…'
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
      <PillButton label="Save entry" onPress={submit} disabled={!text.trim()} style={{ marginTop: spacing.md }} />

      <SectionHeader title="Your entries" />
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
          <Ionicons name="leaf-outline" size={28} color={t.inkFaint} />
          <Text style={{ fontFamily: fonts.sans, fontSize: 14, color: t.inkSoft, marginTop: spacing.sm, textAlign: 'center' }}>
            Nothing here yet. Gratitude grows one line at a time.
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
                  {e.day} · {e.kind === 'gratitude' ? 'Gratitude' : 'Prayer request'}
                  {e.answered ? ' · Answered ✦' : ''}
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
