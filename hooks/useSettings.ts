import { useState, useEffect, useCallback } from 'react';
import * as SQLite from 'expo-sqlite';
import { getSetting, setSetting } from '../database/settings';

export function useSettings(db: SQLite.SQLiteDatabase | null) {
  const getSettingValue = useCallback(
    (key: string, callback: (value: string | null) => void) => {
      if (!db) {
        callback(null);
        return;
      }
      getSetting(db, key, (err, value) => {
        callback(value || null);
      });
    },
    [db]
  );

  const setSettingValue = useCallback(
    (key: string, value: string, callback?: () => void) => {
      if (!db) return;
      setSetting(db, key, value, () => {
        callback?.();
      });
    },
    [db]
  );

  return { getSetting: getSettingValue, setSetting: setSettingValue };
}
