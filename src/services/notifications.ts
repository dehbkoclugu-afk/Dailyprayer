/** Local notifications: daily prayer-time reminder + evening streak save. */
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { translate } from '@/i18n';
import { addDays } from '@/lib/dates';
import { eveningNudgeTime, parseStoredReminderTime } from '@/lib/reminderTime';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const REMINDER_ID = 'daily-prayer-reminder';
/** Legacy repeating evening nudge; replaced by dated one-shot nudges below. */
const LEGACY_STREAK_ID = 'streak-save';
const STREAK_PREFIX = 'streak-save-';
/** Lapsed users get a week of evening nudges, then silence until they return. */
const STREAK_DAYS_AHEAD = 7;
const CHANNEL_ID = 'reminders';

let channelReady: Promise<void> | null = null;
function ensureChannel(): Promise<void> {
  if (Platform.OS !== 'android') return Promise.resolve();
  channelReady ??= Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: translate('profile.reminder'),
    importance: Notifications.AndroidImportance.DEFAULT,
  })
    .then(() => {})
    .catch(() => {
      channelReady = null;
    });
  return channelReady;
}

export async function requestPermission(): Promise<boolean> {
  const settings = await Notifications.requestPermissionsAsync();
  return settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

export async function hasPermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  return settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

export async function scheduleDailyReminder(time: string): Promise<void> {
  const parsed = parseStoredReminderTime(time);
  if (!parsed) throw new Error(`Invalid reminder time: ${time}`);
  await ensureChannel();
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_ID,
    content: {
      title: translate('notification.dailyTitle'),
      body: translate('notification.dailyBody'),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: parsed.hour,
      minute: parsed.minute,
      channelId: CHANNEL_ID,
    },
  });
}

async function cancelStreakNudges(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync().catch(() => []);
  await Promise.all(
    scheduled
      .filter((item) => item.identifier === LEGACY_STREAK_ID || item.identifier.startsWith(STREAK_PREFIX))
      .map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier).catch(() => {})),
  );
}

/**
 * Schedules dated evening nudges for the coming week. Today's nudge is skipped
 * once the user has already completed a ritual step, so nobody is asked to
 * "come back" on a day they already showed up.
 */
export async function scheduleStreakSave(options: {
  doneToday: boolean;
  reminder: string | null;
  now?: Date;
}): Promise<void> {
  const now = options.now ?? new Date();
  const { hour, minute } = eveningNudgeTime(options.reminder);
  await ensureChannel();
  await cancelStreakNudges();
  for (let offset = 0; offset < STREAK_DAYS_AHEAD; offset++) {
    if (offset === 0 && options.doneToday) continue;
    const at = addDays(now, offset);
    at.setHours(hour, minute, 0, 0);
    if (at.getTime() <= now.getTime()) continue;
    await Notifications.scheduleNotificationAsync({
      identifier: `${STREAK_PREFIX}${offset}`,
      content: {
        title: translate('notification.eveningTitle'),
        body: translate('notification.eveningBody'),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: at,
        channelId: CHANNEL_ID,
      },
    });
  }
}

export async function disableReminders(): Promise<void> {
  await Promise.all([
    Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => {}),
    cancelStreakNudges(),
  ]);
}

/**
 * Rebuild every scheduled notification from the persisted preference. Called on
 * launch, when the language changes (so copy is re-rendered in that language)
 * and when today's ritual is completed.
 */
export async function syncReminders(state: {
  prayerTime: string | null;
  doneToday: boolean;
}): Promise<void> {
  const time = state.prayerTime && state.prayerTime !== 'none' ? state.prayerTime : null;
  if (!time || !(await hasPermission())) {
    await disableReminders();
    return;
  }
  await scheduleDailyReminder(time);
  await scheduleStreakSave({ doneToday: state.doneToday, reminder: time });
}
