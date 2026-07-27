/** Local notifications: daily prayer-time reminder + evening streak save. */
import { Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import { translate } from '@/i18n';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const REMINDER_ID = 'daily-prayer-reminder';
const STREAK_ID = 'streak-save';

/**
 * Three states, not a boolean.
 *
 * `blocked` is the one that matters: the user said no and the OS will not prompt
 * again, so asking a second time does nothing and only system settings can undo
 * it. Telling someone "reminder set" in that state is a lie — see roadmap item 16.
 */
export type PermissionState = 'granted' | 'blocked' | 'undetermined';

function toState(settings: Notifications.NotificationPermissionsStatus): PermissionState {
  const granted =
    settings.granted ||
    settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  if (granted) return 'granted';
  // canAskAgain false means the prompt is spent; the only way back is settings.
  return settings.canAskAgain ? 'undetermined' : 'blocked';
}

/** Current permission, without prompting. Safe to call on every screen focus. */
export async function getPermissionState(): Promise<PermissionState> {
  try {
    return toState(await Notifications.getPermissionsAsync());
  } catch {
    // Web and unsupported platforms: treat as blocked so nothing claims success.
    return 'blocked';
  }
}

/** Prompt if the OS still allows it, and report what we ended up with. */
export async function requestPermissionState(): Promise<PermissionState> {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (toState(current) !== 'undetermined') return toState(current);
    return toState(await Notifications.requestPermissionsAsync());
  } catch {
    return 'blocked';
  }
}

/** Kept for callers that only need to know whether scheduling will work. */
export async function requestPermission(): Promise<boolean> {
  return (await requestPermissionState()) === 'granted';
}

/** Open this app's page in the OS settings, the only route back from `blocked`. */
export async function openSystemSettings(): Promise<void> {
  await Linking.openSettings();
}

export async function scheduleDailyReminder(time: string): Promise<void> {
  const [hour, minute] = time.split(':').map(Number);
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_ID,
    content: {
      title: translate('notification.dailyTitle'),
      body: translate('notification.dailyBody'),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

/**
 * Cancel both scheduled notifications.
 *
 * Turning reminders off used to only write `prayerTime: 'none'` and leave the
 * schedule in place, so the row said "Off" while notifications kept arriving —
 * the same class of untruth as the dead success message.
 */
export async function cancelReminders(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => {});
  await Notifications.cancelScheduledNotificationAsync(STREAK_ID).catch(() => {});
}

export async function scheduleStreakSave(streak = 0): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(STREAK_ID).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: STREAK_ID,
    content: {
      title: translate('notification.eveningTitle'),
      body: translate('notification.eveningBody'),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 30,
    },
  });
}
