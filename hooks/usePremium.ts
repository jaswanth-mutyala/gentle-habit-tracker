import { useState, useEffect, useCallback } from 'react';
import * as SQLite from 'expo-sqlite';
import { canAddHabit } from '../utils/premium';
import { getSetting, setSetting } from '../database/settings';
import { Habit } from '../database/habits';
import { useQonversion } from '../contexts/QonversionContext';

export function usePremium(db: SQLite.SQLiteDatabase | null, habits: Habit[]) {
  const { isPremium: qonversionPremium } = useQonversion();
  const [localPremium, setLocalPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    getSetting(db, 'premium_unlocked', (err, value) => {
      setLocalPremium(value === 'true');
      setLoading(false);
    });
  }, [db]);

  const isPremium = localPremium || qonversionPremium;

  const checkCanAdd = useCallback(() => {
    return canAddHabit(habits.length, isPremium);
  }, [habits.length, isPremium]);

  const unlockPremium = useCallback(() => {
    if (!db) return;
    setSetting(db, 'premium_unlocked', 'true', (err) => {
      if (!err) {
        setLocalPremium(true);
      }
    });
  }, [db]);

  return { isPremium, loading, checkCanAdd, unlockPremium };
}
