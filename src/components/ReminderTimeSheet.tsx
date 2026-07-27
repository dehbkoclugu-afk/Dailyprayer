import React from 'react';
import { Modal, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { useT } from '@/i18n';
import { useSheetTitleFocus } from '@/a11y/sheetFocus';
import { formatTime, parseTime, prefers24Hour, toDate, toStoredTime } from '@/lib/time';

const DEFAULT_TIME = '07:30';

/**
 * Any minute of the day, in the device's own clock convention (roadmap item 17).
 *
 * The reminder used to be three fixed times in a native `Alert` — 07:30, 12:30,
 * 21:00 — which is not a time picker, and a 12-hour reader saw "21:00".
 *
 * Platforms want opposite things, so this hands each what it expects: Android
 * opens the system clock dialog imperatively and commits on OK, while iOS renders
 * the spinner inline and commits on Save. Both write the same 24-hour `HH:MM`.
 */
export function ReminderTimeSheet({
  visible,
  current,
  onPick,
  onTurnOff,
  onClose,
}: {
  visible: boolean;
  /** Stored `HH:MM`, or null when no reminder is set. */
  current: string | null;
  onPick: (time: string) => void;
  onTurnOff: () => void;
  onClose: () => void;
}) {
  const t = useTheme();
  const { t: tr } = useT();
  const insets = useSafeAreaInsets();

  const initial = parseTime(current) ?? parseTime(DEFAULT_TIME)!;
  const [draft, setDraft] = React.useState(initial);
  const titleRef = useSheetTitleFocus(visible);
  // Only used where no native picker exists; kept as text so a half-typed value
  // does not fight the caret.
  const [typed, setTyped] = React.useState(() => toStoredTime(initial));

  React.useEffect(() => {
    if (visible) {
      const next = parseTime(current) ?? parseTime(DEFAULT_TIME)!;
      setDraft(next);
      setTyped(toStoredTime(next));
    }
  }, [visible, current]);

  const tap = () => Haptics.selectionAsync().catch(() => {});

  const openAndroidClock = () => {
    tap();
    DateTimePickerAndroid.open({
      value: toDate(draft),
      mode: 'time',
      // iOS reads the system setting itself; Android has to be told.
      is24Hour: prefers24Hour(),
      onChange: (event, date) => {
        if (event.type !== 'set' || !date) return;
        onPick(toStoredTime({ hour: date.getHours(), minute: date.getMinutes() }));
      },
    });
  };

  const save = () => {
    // Off iOS/Android the typed field is the source of truth; ignore an invalid
    // entry rather than silently saving the old time.
    const chosen = Platform.OS === 'ios' ? draft : (parseTime(typed) ?? draft);
    if (Platform.OS !== 'ios' && !parseTime(typed)) return;
    tap();
    onPick(toStoredTime(chosen));
  };

  const button = (
    label: string,
    onPress: () => void,
    tone: 'primary' | 'quiet' | 'danger' = 'quiet',
  ) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        minHeight: 52,
        borderRadius: radius.inner,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.sm,
        backgroundColor: tone === 'primary' ? t.gold : t.surfaceAlt,
        borderWidth: 1,
        borderColor: tone === 'primary' ? t.gold : t.border,
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <Text
        style={{
          fontFamily: fonts.sansSemiBold,
          fontSize: 15,
          color: tone === 'primary' ? t.onGold : tone === 'danger' ? t.danger : t.ink,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
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

          <Text
            ref={titleRef}
            accessibilityRole="header"
            style={{ fontFamily: fonts.serif, fontSize: 22, color: t.ink }}
          >
            {tr('profile.reminderTitle')}
          </Text>
          <Text
            style={{
              fontFamily: fonts.sans,
              fontSize: 15,
              lineHeight: 23,
              color: t.inkSoft,
              marginTop: spacing.xs,
            }}
          >
            {tr('profile.reminderMsg')}
          </Text>

          {Platform.OS === 'android' ? (
            <Pressable
              onPress={openAndroidClock}
              accessibilityRole="button"
              accessibilityLabel={`${tr('profile.reminderPick')} — ${formatTime(toStoredTime(draft)) ?? ''}`}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: spacing.lg,
                minHeight: 64,
                paddingHorizontal: spacing.lg,
                borderRadius: radius.inner,
                backgroundColor: t.surfaceAlt,
                borderWidth: 1,
                borderColor: t.border,
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <Ionicons name="time-outline" size={20} color={t.inkSoft} />
                <Text style={{ fontFamily: fonts.sansMedium, fontSize: 15, color: t.inkSoft }}>
                  {tr('profile.reminderPick')}
                </Text>
              </View>
              <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 18, color: t.gold }}>
                {formatTime(toStoredTime(draft))}
              </Text>
            </Pressable>
          ) : Platform.OS === 'ios' ? (
            <View style={{ marginTop: spacing.md, alignItems: 'center' }}>
              <DateTimePicker
                value={toDate(draft)}
                mode="time"
                display="spinner"
                accessibilityLabel={tr('profile.reminderTitle')}
                onChange={(_event, date) => {
                  if (date) setDraft({ hour: date.getHours(), minute: date.getMinutes() });
                }}
              />
            </View>
          ) : (
            // The native picker renders nothing off iOS/Android, which would leave
            // a sheet with a Save button and no way to choose. Type it instead.
            <TextInput
              value={typed}
              onChangeText={setTyped}
              placeholder="HH:MM"
              placeholderTextColor={t.inkFaint}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
              accessibilityLabel={tr('profile.reminderPick')}
              style={{
                marginTop: spacing.lg,
                minHeight: 56,
                paddingHorizontal: spacing.lg,
                borderRadius: radius.inner,
                backgroundColor: t.surfaceAlt,
                borderWidth: 1,
                borderColor: parseTime(typed) ? t.border : t.danger,
                fontFamily: fonts.sansSemiBold,
                fontSize: 18,
                color: t.ink,
              }}
            />
          )}

          {Platform.OS === 'android' ? null : button(tr('profile.reminderSave'), save, 'primary')}
          {current ? button(tr('profile.reminderOff'), onTurnOff, 'danger') : null}
          {button(tr('data.cancel'), onClose)}
        </View>
      </View>
    </Modal>
  );
}
