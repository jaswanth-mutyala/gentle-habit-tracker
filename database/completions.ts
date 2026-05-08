type ExpoSQLiteDatabaseLike = {
  runAsync?: (source: string, ...params: any[]) => Promise<{ lastInsertRowId?: number }>;
  getAllAsync?: <T>(source: string, ...params: any[]) => Promise<T[]>;
  getFirstAsync?: <T>(source: string, ...params: any[]) => Promise<T | null>;
  run?: (
    source: string,
    params: any[],
    callback: (this: { lastID?: number }, err: Error | null) => void
  ) => void;
  all?: (source: string, params: any[], callback: (err: Error | null, rows: any[]) => void) => void;
  get?: (source: string, params: any[], callback: (err: Error | null, row: any) => void) => void;
};

export interface Completion {
  id: number;
  habit_id: number;
  date: string;
  status: 'done' | 'skipped' | 'neutral';
  completed_at: string | null;
  duration_logged: number;
}

export function recordCompletion(
  db: ExpoSQLiteDatabaseLike,
  habitId: number,
  date: string,
  status: 'done' | 'skipped' | 'neutral',
  durationLoggedOrCallback: number | ((err: Error | null) => void) = 0,
  callback?: (err: Error | null) => void
): void {
  const durationLogged =
    typeof durationLoggedOrCallback === 'number' ? durationLoggedOrCallback : 0;
  const finalCallback =
    typeof durationLoggedOrCallback === 'function'
      ? durationLoggedOrCallback
      : callback || (() => {});
  const now = new Date().toISOString();

  const findExisting = async () => {
    if (typeof db.getFirstAsync === 'function') {
      return db.getFirstAsync<{ id: number }>('SELECT id FROM completions WHERE habit_id = ? AND date = ?', habitId, date);
    }

    return new Promise<{ id: number } | null>((resolve, reject) => {
      db.get?.('SELECT id FROM completions WHERE habit_id = ? AND date = ?', [habitId, date], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row || null);
      });
    });
  };

  findExisting()
    .then((row) => {
      if (row) {
        if (typeof db.runAsync === 'function') {
          return db
            .runAsync('UPDATE completions SET status = ?, completed_at = ?, duration_logged = ? WHERE id = ?', status, now, durationLogged, row.id)
            .then(() => finalCallback(null));
        }

        db.run?.(
          'UPDATE completions SET status = ?, completed_at = ?, duration_logged = ? WHERE id = ?',
          [status, now, durationLogged, row.id],
          (err) => finalCallback(err || null)
        );
        return;
      }

      if (typeof db.runAsync === 'function') {
        db.runAsync(
          `INSERT INTO completions (habit_id, date, status, completed_at, duration_logged)
           VALUES (?, ?, ?, ?, ?)`,
          habitId,
          date,
          status,
          now,
          durationLogged
        )
          .then(() => finalCallback(null))
          .catch((err) => finalCallback(err));
        return;
      }

      db.run?.(
        `INSERT INTO completions (habit_id, date, status, completed_at, duration_logged)
         VALUES (?, ?, ?, ?, ?)`,
        [habitId, date, status, now, durationLogged],
        (err) => finalCallback(err || null)
      );
    })
    .catch((err) => finalCallback(err));
}

export function getCompletionsForDate(
  db: ExpoSQLiteDatabaseLike,
  date: string,
  callback: (err: Error | null, completions?: Completion[]) => void
): void {
  const query = 'SELECT * FROM completions WHERE date = ?';

  if (typeof db.getAllAsync === 'function') {
    db
      .getAllAsync<Completion>(query, date)
      .then((rows) => callback(null, rows))
      .catch((err) => callback(err));
    return;
  }

  db.all?.(query, [date], (err, rows) => {
    callback(err, rows as Completion[]);
  });
}

export function getCompletionsForHabitRange(
  db: ExpoSQLiteDatabaseLike,
  habitId: number,
  startDate: string,
  endDate: string,
  callback: (err: Error | null, completions?: Completion[]) => void
): void {
  const query = 'SELECT * FROM completions WHERE habit_id = ? AND date >= ? AND date <= ? ORDER BY date';

  if (typeof db.getAllAsync === 'function') {
    db
      .getAllAsync<Completion>(query, habitId, startDate, endDate)
      .then((rows) => callback(null, rows))
      .catch((err) => callback(err));
    return;
  }

  db.all?.(query, [habitId, startDate, endDate], (err, rows) => {
    callback(err || null, rows as Completion[]);
  });
}
