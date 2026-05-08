import sqlite3 from 'sqlite3';
import { getSchemaSQL } from '../../database/schema';
import { createHabit, getHabits, Habit } from '../../database/habits';

describe('habit database operations', () => {
  let db: sqlite3.Database;

  beforeEach((done) => {
    db = new sqlite3.Database(':memory:');
    db.exec(getSchemaSQL(), done);
  });

  afterEach((done) => {
    db.close(done);
  });

  it('inserts a habit and retrieves it', (done) => {
    const habit: Omit<Habit, 'id' | 'created_at' | 'updated_at'> = {
      name: 'Drink water',
      color: '#7D9B76',
      icon: 'droplet',
      reminder_time: '08:00',
      reminder_enabled: 1,
      is_timed: 0,
      duration_seconds: 0,
      sort_order: 0,
      is_archived: 0,
    };

    createHabit(db, habit, (err: Error | null, habitId?: number) => {
      expect(err).toBeNull();
      expect(habitId).toBeDefined();

      getHabits(db, (err: Error | null, habits?: Habit[]) => {
        expect(err).toBeNull();
        expect(habits!.length).toBe(1);
        expect(habits![0].name).toBe('Drink water');
        expect(habits![0].color).toBe('#7D9B76');
        done();
      });
    });
  });
});
