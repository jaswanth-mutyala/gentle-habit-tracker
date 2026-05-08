import React, { useCallback, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  useFonts,
} from '@expo-google-fonts/inter';
import { DatabaseProvider } from '../contexts/DatabaseContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { QonversionProvider } from '../contexts/QonversionContext';
import { getSetting, setSetting } from '../database/settings';
import { recordCompletion } from '../database/completions';
import { setupNotificationChannel } from '../utils/notifications';
import { getTodayKey } from '../utils/date';
import { showBatteryOptimizationDialog } from '../utils/battery';
import { useDatabase } from '../contexts/DatabaseContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    priority: Notifications.AndroidNotificationPriority.MAX,
  }),
});

function AppBootstrap() {
  const router = useRouter();
  const { db, isReady } = useDatabase();

  const openAlarm = useCallback(
    (data: Record<string, unknown> | undefined) => {
      const habitId = data?.habitId;
      if (habitId === undefined || habitId === null) return;

      router.push({
        pathname: '/alarm',
        params: { habitId: String(habitId) },
      });
    },
    [router]
  );

  const handleNotificationResponse = useCallback(
    (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data;
      const habitId = Number(data?.habitId);

      if (response.actionIdentifier === 'skip' && db && Number.isFinite(habitId)) {
        recordCompletion(db, habitId, getTodayKey(), 'skipped', () => {});
        return;
      }

      openAlarm(data);
    },
    [db, openAlarm]
  );

  useEffect(() => {
    setupNotificationChannel();

    const subscription = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);

    if (Platform.OS !== 'web') {
      Notifications.getLastNotificationResponseAsync().then((response) => {
        if (response) {
          handleNotificationResponse(response);
        }
      });
    }

    return () => subscription.remove();
  }, [handleNotificationResponse]);

  useEffect(() => {
    if (!db || !isReady) return;

    getSetting(db, 'last_open_date', (_err, value) => {
      const today = getTodayKey();

      if (value) {
        const lastOpen = new Date(`${value}T00:00:00`);
        const now = new Date(`${today}T00:00:00`);
        const daysAway = Math.floor((now.getTime() - lastOpen.getTime()) / 86400000);

        if (daysAway >= 3) {
          router.push('/welcome-back');
        }
      }

      setSetting(db, 'last_open_date', today, () => {});
    });

    if (Platform.OS === 'android') {
      getSetting(db, 'battery_prompted', (_err, value) => {
        if (value === 'true') return;

        Alert.alert(
          'Keep reminders reliable',
          'Android battery optimization can delay habit alarms. Open settings and allow Gentle to run reminders on time.',
          [
            { text: 'Later', style: 'cancel' },
            { text: 'Open settings', onPress: showBatteryOptimizationDialog },
          ]
        );
        setSetting(db, 'battery_prompted', 'true', () => {});
      });
    }
  }, [db, isReady, router]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DatabaseProvider>
        <ThemeProvider>
          <QonversionProvider>
            <AppBootstrap />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
              <Stack.Screen name="timer" options={{ presentation: 'modal' }} />
              <Stack.Screen name="alarm" options={{ presentation: 'fullScreenModal' }} />
              <Stack.Screen name="welcome-back" options={{ presentation: 'transparentModal' }} />
            </Stack>
          </QonversionProvider>
        </ThemeProvider>
      </DatabaseProvider>
    </GestureHandlerRootView>
  );
}
