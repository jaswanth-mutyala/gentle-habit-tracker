import * as SQLite from 'expo-sqlite';
import { getSetting, setSetting } from './settings';

const defaultSettings: Record<string, string> = {
  theme: 'system',
  onboarding_complete: 'false',
  last_open_date: '',
  notifications_asked: 'false',
  premium_unlocked: 'false',
  backup_enabled: 'false',
  haptics_enabled: 'true',
  sound_enabled: 'true',
  habit_limit: '3',
  battery_prompted: 'false',
};

export async function seedDefaults(db: SQLite.SQLiteDatabase): Promise<void> {
  return new Promise((resolve) => {
    getSetting(db, 'theme', (err, value) => {
      if (err || value === null) {
        // Seed defaults
        const entries = Object.entries(defaultSettings);
        let completed = 0;
        entries.forEach(([key, val]) => {
          setSetting(db, key, val, () => {
            completed++;
            if (completed === entries.length) {
              resolve();
            }
          });
        });
      } else {
        resolve();
      }
    });
  });
}
