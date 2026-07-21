/** Local notifications: daily prayer-time reminder + evening streak save. */
import * as Notifications from 'expo-notifications';

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
  const [hour, minute] = time.split(':').map(Number);
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_ID,
    content: {
      title: 'Time to be still 🕊',
      body: 'Your verse and prayer for today are ready.',
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
      title: streak > 1 ? `Don't lose your ${streak}-day streak` : "Don't lose your streak",
      body: 'One minute with today’s verse keeps your flame lit.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 30,
    },
  });
}
