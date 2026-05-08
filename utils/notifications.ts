import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function setupNotificationChannel() {
  if (Platform.OS !== 'web') {
    await Notifications.setNotificationCategoryAsync('habit-reminder', [
      {
        identifier: 'start',
        buttonTitle: 'Start now',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'skip',
        buttonTitle: 'Skip today',
        options: { opensAppToForeground: true },
      },
    ]);
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('habit-reminders', {
      name: 'Habit Reminders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#7D9B76',
      sound: 'gentle-chime.wav',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }
}

export function getNotificationPermissions() {
  return Notifications.getPermissionsAsync();
}

export async function requestNotificationPermissions() {
  return Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
      allowCriticalAlerts: true,
    },
  });
}
