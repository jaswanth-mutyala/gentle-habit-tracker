import { Platform } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';

export function showBatteryOptimizationDialog() {
  if (Platform.OS !== 'android') return;

  IntentLauncher.startActivityAsync('android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS');
}
