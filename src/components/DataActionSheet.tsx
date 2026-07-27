import React from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/typography';
import { radius, spacing, TAP_MIN } from '@/theme/tokens';
import { useT } from '@/i18n';
import { useSheetTitleFocus } from '@/a11y/sheetFocus';
import {
  collectDataSummary,
  deleteAllUserData,
  restartOnboarding,
  type DataSummary,
} from '@/state/dataReset';

export type DataAction = 'restart' | 'delete';

/**
 * Two-stage confirmation for the destructive data actions (roadmap item 14).
 *
 * Stage 1 itemizes what goes and what stays, with real counts — a streak of 41 days
 * and 12 journal entries reads very differently from "your data". Stage 2 is a
 * separate, deliberate confirmation, so neither action can happen on one stray tap.
 *
 * Restart and delete are kept apart on purpose: restarting onboarding used to fire
 * immediately from a single tap, and it must never be a route to losing a journal.
 */
export function DataActionSheet({
  action,
  onClose,
  onDone,
}: {
  action: DataAction | null;
  onClose: () => void;
  onDone: (action: DataAction) => void;
}) {
  const t = useTheme();
  const { t: tr } = useT();
  const insets = useSafeAreaInsets();
  const [stage, setStage] = React.useState<1 | 2>(1);
  // Mounted only while open, so it is visible from its first render.
  const titleRef = useSheetTitleFocus(true, stage);
  const [summary, setSummary] = React.useState<DataSummary | null>(null);

  // Snapshot the counts when the sheet opens so they cannot shift mid-decision.
  React.useEffect(() => {
    if (action) {
      setSummary(collectDataSummary());
      setStage(1);
    }
  }, [action]);

  if (!action || !summary) return null;

  const deleting = action === 'delete';
  const plural = (n: number, key: 'data.itemEntries' | 'data.itemDays' | 'data.itemVerses' | 'data.itemPrayers') =>
    `${n} ${tr(key)}`;

  // What the action removes, itemized with counts. Zero-count lines are dropped so
  // the list never threatens to delete something the user does not have.
  const removed: string[] = deleting
    ? [
        summary.name ? `${tr('data.itemName')}: ${summary.name}` : null,
        summary.hasQuizAnswers ? tr('data.itemQuiz') : null,
        summary.journalEntries ? `${tr('data.itemJournal')} — ${plural(summary.journalEntries, 'data.itemEntries')}` : null,
        summary.highlights ? `${tr('data.itemHighlights')} — ${summary.highlights}` : null,
        summary.bookmarks ? `${tr('data.itemBookmarks')} — ${summary.bookmarks}` : null,
        summary.savedVerses ? `${tr('data.itemSaved')} — ${plural(summary.savedVerses, 'data.itemVerses')}` : null,
        summary.streakDays || summary.bestStreak
          ? `${tr('data.itemStreak')} — ${plural(summary.streakDays, 'data.itemDays')} (${tr('data.itemBest')} ${summary.bestStreak})`
          : null,
        summary.planProgressDays ? `${tr('data.itemPlan')} — ${plural(summary.planProgressDays, 'data.itemDays')}` : null,
        summary.favoritePrayers ? `${tr('data.itemFavorites')} — ${plural(summary.favoritePrayers, 'data.itemPrayers')}` : null,
        tr('data.itemPosition'),
      ].filter((line): line is string => Boolean(line))
    : [
        summary.name ? `${tr('data.itemName')}: ${summary.name}` : tr('data.itemName'),
        tr('data.itemQuiz'),
      ];

  // What survives. For restart this is the whole point of the screen.
  const kept: string[] = deleting
    ? [tr('data.keepPlus'), tr('data.keepSettings')]
    : [
        summary.journalEntries ? `${tr('data.itemJournal')} — ${plural(summary.journalEntries, 'data.itemEntries')}` : tr('data.itemJournal'),
        summary.highlights ? `${tr('data.itemHighlights')} — ${summary.highlights}` : tr('data.itemHighlights'),
        summary.bookmarks ? `${tr('data.itemBookmarks')} — ${summary.bookmarks}` : tr('data.itemBookmarks'),
        summary.streakDays
          ? `${tr('data.itemStreak')} — ${plural(summary.streakDays, 'data.itemDays')}`
          : tr('data.itemStreak'),
        tr('data.itemPlan'),
        tr('data.keepPlus'),
      ];

  const confirm = () => {
    if (stage === 1) {
      Haptics.selectionAsync().catch(() => {});
      setStage(2);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    if (deleting) deleteAllUserData();
    else restartOnboarding();
    onDone(action);
  };

  const list = (title: string, items: string[], tone: 'remove' | 'keep') => (
    <View style={{ marginTop: spacing.lg }}>
      <Text
        style={{
          fontFamily: fonts.sansSemiBold,
          fontSize: 12,
          letterSpacing: 1.2,
          color: t.inkFaint,
        }}
      >
        {title}
      </Text>
      {items.map((item) => (
        <View key={item} style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
          <Ionicons
            name={tone === 'remove' ? 'close-circle-outline' : 'checkmark-circle-outline'}
            size={18}
            color={tone === 'remove' ? t.danger : t.gold}
          />
          <Text style={{ fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: t.ink, flex: 1 }}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      {/* iOS needs telling that the sheet is modal; on Android the Modal is a
          separate window and TalkBack cannot reach behind it anyway. */}
      <View style={{ flex: 1, backgroundColor: 'rgba(6,8,16,0.6)' }} accessibilityViewIsModal>
        <Pressable
          style={{ flex: 1 }}
          onPress={onClose}
          importantForAccessibility="no"
          accessibilityElementsHidden
        />
        <View
          style={{
            backgroundColor: t.surface,
            borderTopLeftRadius: radius.card,
            borderTopRightRadius: radius.card,
            borderWidth: 1,
            borderBottomWidth: 0,
            borderColor: t.border,
            paddingTop: spacing.md,
            paddingHorizontal: spacing.xl,
            paddingBottom: insets.bottom + spacing.lg,
            maxHeight: '88%',
          }}
        >
          <View
            style={{
              alignSelf: 'center',
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: t.border,
              marginBottom: spacing.lg,
            }}
          />

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Focus lands here on open, and again when the second stage
                replaces the wording — the change is the whole point of stage 2. */}
            <Text
              ref={titleRef}
              accessibilityRole="header"
              style={{ fontFamily: fonts.serif, fontSize: 22, color: t.ink }}
            >
              {stage === 2
                ? tr(deleting ? 'data.deleteFinalTitle' : 'data.restartFinalTitle')
                : tr(deleting ? 'data.deleteTitle' : 'data.restartTitle')}
            </Text>
            <Text
              style={{
                fontFamily: fonts.sans,
                fontSize: 15,
                lineHeight: 23,
                color: t.inkSoft,
                marginTop: spacing.sm,
              }}
            >
              {stage === 2
                ? tr(deleting ? 'data.deleteFinalBody' : 'data.restartFinalBody')
                : tr(deleting ? 'data.deleteBody' : 'data.restartBody')}
            </Text>

            {stage === 1 ? (
              <>
                {list(tr(deleting ? 'data.willDelete' : 'data.willReset'), removed, 'remove')}
                {list(tr('data.willKeep'), kept, 'keep')}
              </>
            ) : null}
          </ScrollView>

          <Pressable
            onPress={confirm}
            accessibilityRole="button"
            accessibilityLabel={
              stage === 2
                ? tr(deleting ? 'data.deleteConfirm' : 'data.restartConfirm')
                : tr('data.continue')
            }
            style={({ pressed }) => ({
              marginTop: spacing.lg,
              minHeight: 52,
              borderRadius: radius.inner,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: stage === 2 ? t.danger : t.surfaceAlt,
              borderWidth: 1,
              borderColor: stage === 2 ? t.danger : t.border,
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <Text
              style={{
                fontFamily: fonts.sansSemiBold,
                fontSize: 15,
                color: stage === 2 ? t.onGold : t.ink,
              }}
            >
              {stage === 2
                ? tr(deleting ? 'data.deleteConfirm' : 'data.restartConfirm')
                : tr('data.continue')}
            </Text>
          </Pressable>

          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={tr('data.cancel')}
            style={({ pressed }) => ({
              marginTop: spacing.sm,
              minHeight: TAP_MIN,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Text style={{ fontFamily: fonts.sansMedium, fontSize: 15, color: t.inkSoft }}>
              {tr('data.cancel')}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
