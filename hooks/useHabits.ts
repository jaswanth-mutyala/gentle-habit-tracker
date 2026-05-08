import { useState, useEffect, useCallback } from 'react';
import * as SQLite from 'expo-sqlite';
import {
  Habit,
  archiveHabit as dbArchive,
  createHabit as dbCreate,
  getHabits as dbGetAll,
  updateHabit as dbUpdate,
} from '../database/habits';

export function useHabits(db: SQLite.SQLiteDatabase | null) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHabits = useCallback(() => {
    if (!db) {
      setHabits([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    dbGetAll(db, (err, result) => {
      if (!err && result) {
        setHabits(result);
      }
      setLoading(false);
    });
  }, [db]);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  const addHabit = useCallback(
    (
      habit: Omit<Habit, 'id' | 'created_at' | 'updated_at'>,
      callback?: (err: Error | null, id?: number) => void
    ) => {
      if (!db) {
        callback?.(new Error('Database not ready'));
        return;
      }
      dbCreate(db, habit, (err, id) => {
        if (!err) {
          loadHabits();
        }
        callback?.(err, id);
      });
    },
    [db, loadHabits]
  );

  const updateHabit = useCallback(
    (habit: Habit, callback?: (err: Error | null) => void) => {
      if (!db) {
        callback?.(new Error('Database not ready'));
        return;
      }
      dbUpdate(db, habit, (err) => {
        if (!err) {
          loadHabits();
        }
        callback?.(err);
      });
    },
    [db, loadHabits]
  );

  const archiveHabit = useCallback(
    (id: number, callback?: (err: Error | null) => void) => {
      if (!db) {
        callback?.(new Error('Database not ready'));
        return;
      }
      dbArchive(db, id, (err) => {
        if (!err) {
          loadHabits();
        }
        callback?.(err);
      });
    },
    [db, loadHabits]
  );

  return { habits, loading, addHabit, updateHabit, archiveHabit, reload: loadHabits };
}
