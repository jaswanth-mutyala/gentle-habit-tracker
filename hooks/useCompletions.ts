import { useState, useEffect, useCallback } from 'react';
import * as SQLite from 'expo-sqlite';
import { recordCompletion as dbRecord } from '../database/completions';
import { getCompletionsForDate as dbGetForDate } from '../database/completions';
import { Completion } from '../database/completions';

export function useCompletions(db: SQLite.SQLiteDatabase | null, date: string) {
  const [completions, setCompletions] = useState<Completion[]>([]);

  const loadCompletions = useCallback(() => {
    if (!db) {
      setCompletions([]);
      return;
    }
    dbGetForDate(db, date, (err, result) => {
      if (!err && result) {
        setCompletions(result);
      }
    });
  }, [db, date]);

  useEffect(() => {
    loadCompletions();
  }, [loadCompletions]);

  const recordCompletion = useCallback(
    (habitId: number, status: 'done' | 'skipped' | 'neutral', durationLogged = 0) => {
      if (!db) return;
      dbRecord(db, habitId, date, status, durationLogged, () => {
        loadCompletions();
      });
    },
    [db, date, loadCompletions]
  );

  return { completions, recordCompletion, reload: loadCompletions };
}
