import { useState, useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { setupNotificationChannel } from '../utils/notifications';

export function useNotifications() {
  const [permission, setPermission] = useState<Notifications.NotificationPermissionsStatus | null>(null);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = useCallback(async () => {
    const status = await Notifications.getPermissionsAsync();
    setPermission(status);
  }, []);

  const requestPermissions = useCallback(async () => {
    const status = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowCriticalAlerts: true,
      },
    });
    setPermission(status);
    return status;
  }, []);

  const scheduleHabitReminder = useCallback(
    async (habitId: number, time: string, habitName: string) => {
      if (Platform.OS === 'android') {
        await setupNotificationChannel();
      }

      const [hours, minutes] = time.split(':').map(Number);
      const trigger: Notifications.DailyTriggerInput = {
        hour: hours,
        minute: minutes,
        channelId: 'habit-reminders',
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
      };

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: habitName,
          body: "Time for your habit!",
          data: { habitId, action: 'start' },
          sound: 'gentle-chime.wav',
          priority: Notifications.AndroidNotificationPriority.MAX,
          interruptionLevel: 'critical',
          categoryIdentifier: 'habit-reminder',
          sticky: true,
          autoDismiss: false,
        },
        trigger,
      });

      return id;
    },
    []
  );

  const cancelHabitReminder = useCallback(async (notificationId: string) => {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }, []);

  return {
    permission,
    checkPermissions,
    requestPermissions,
    scheduleHabitReminder,
    cancelHabitReminder,
  };
}
