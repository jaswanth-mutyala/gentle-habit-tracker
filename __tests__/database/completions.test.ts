import sqlite3 from 'sqlite3';
import { getSchemaSQL } from '../../database/schema';
import { createHabit } from '../../database/habits';
import { recordCompletion, getCompletionsForDate } from '../../database/completions';

describe('completion database operations', () => {
  let db: sqlite3.Database;
  let habitId: number;

  beforeEach((done) => {
    db = new sqlite3.Database(':memory:');
    db.exec(getSchemaSQL(), () => {
      createHabit(
        db,
        {
          name: 'Drink water',
          color: '#7D9B76',
          icon: 'droplet',
          reminder_time: '08:00',
          reminder_enabled: 1,
          is_timed: 0,
          duration_seconds: 0,
          sort_order: 0,
          is_archived: 0,
        },
        (err: Error | null, id?: number) => {
          habitId = id!;
          done();
        }
      );
    });
  });

  afterEach((done) => {
    db.close(done);
  });

  it('records a completion and retrieves it for a date', (done) => {
    const date = '2026-05-05';

    recordCompletion(db, habitId, date, 'done', (err: Error | null) => {
      expect(err).toBeNull();

      getCompletionsForDate(db, date, (err: Error | null, completions?: any[]) => {
        expect(err).toBeNull();
        expect(completions!.length).toBe(1);
        expect(completions![0].habit_id).toBe(habitId);
        expect(completions![0].status).toBe('done');
        done();
      });
    });
  });
});
