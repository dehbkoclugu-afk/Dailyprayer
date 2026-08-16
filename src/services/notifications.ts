/** Local notifications: daily prayer-time reminder + evening streak save. */
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

export async function requestPermission(): Promise<boolean> {
  const settings = await Notifications.requestPermissionsAsync();
  return settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

export async function scheduleDailyReminder(time: string): Promise<void> {
  const match = time.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!match) throw new Error(`Reminder time is not a stored HH:MM value: ${time}`);
  const hour = Number(match[1]);
  const minute = Number(match[2]);
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

export async function disableReminders(): Promise<void> {
  await Promise.all([
    Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => {}),
    Notifications.cancelScheduledNotificationAsync(STREAK_ID).catch(() => {}),
  ]);
}
