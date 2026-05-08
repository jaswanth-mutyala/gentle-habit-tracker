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

export interface Habit {
  id: number;
  name: string;
  color: string;
  icon: string;
  reminder_time: string | null;
  reminder_enabled: number;
  is_timed: number;
  duration_seconds: number;
  created_at: string;
  updated_at: string;
  sort_order: number;
  is_archived: number;
}

export function createHabit(
  db: ExpoSQLiteDatabaseLike,
  habit: Omit<Habit, 'id' | 'created_at' | 'updated_at'>,
  callback: (err: Error | null, habitId?: number) => void
): void {
  const now = new Date().toISOString();
  const params = [
    habit.name,
    habit.color,
    habit.icon,
    habit.reminder_time || null,
    habit.reminder_enabled,
    habit.is_timed,
    habit.duration_seconds,
    now,
    now,
    habit.sort_order,
    habit.is_archived,
  ];

  if (typeof db.runAsync === 'function') {
    db
      .runAsync(
        `INSERT INTO habits (name, color, icon, reminder_time, reminder_enabled,
          is_timed, duration_seconds, created_at, updated_at, sort_order, is_archived)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ...params
      )
      .then((result) => callback(null, result.lastInsertRowId))
      .catch((err) => callback(err));
    return;
  }

  db.run?.(
    `INSERT INTO habits (name, color, icon, reminder_time, reminder_enabled,
      is_timed, duration_seconds, created_at, updated_at, sort_order, is_archived)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    params,
    function (err) {
      callback(err, this.lastID);
    }
  );
}

export function getHabits(
  db: ExpoSQLiteDatabaseLike,
  callback: (err: Error | null, habits?: Habit[]) => void
): void {
  const query = 'SELECT * FROM habits WHERE is_archived = 0 ORDER BY sort_order, id';

  if (typeof db.getAllAsync === 'function') {
    db
      .getAllAsync<Habit>(query)
      .then((rows) => callback(null, rows))
      .catch((err) => callback(err));
    return;
  }

  db.all?.(query, [], (err, rows) => {
    callback(err, rows as Habit[]);
  });
}

export function getHabitById(
  db: ExpoSQLiteDatabaseLike,
  id: number,
  callback: (err: Error | null, habit?: Habit | null) => void
): void {
  const query = 'SELECT * FROM habits WHERE id = ? AND is_archived = 0';

  if (typeof db.getFirstAsync === 'function') {
    db
      .getFirstAsync<Habit>(query, id)
      .then((row) => callback(null, row))
      .catch((err) => callback(err));
    return;
  }

  db.get?.(query, [id], (err, row) => {
    callback(err || null, (row as Habit | undefined) || null);
  });
}

export function updateHabit(
  db: ExpoSQLiteDatabaseLike,
  habit: Habit,
  callback: (err: Error | null) => void
): void {
  const now = new Date().toISOString();
  const params = [
    habit.name,
    habit.color,
    habit.icon,
    habit.reminder_time || null,
    habit.reminder_enabled,
    habit.is_timed,
    habit.duration_seconds,
    now,
    habit.sort_order,
    habit.is_archived,
    habit.id,
  ];

  const query = `UPDATE habits
    SET name = ?, color = ?, icon = ?, reminder_time = ?, reminder_enabled = ?,
      is_timed = ?, duration_seconds = ?, updated_at = ?, sort_order = ?, is_archived = ?
    WHERE id = ?`;

  if (typeof db.runAsync === 'function') {
    db.runAsync(query, ...params).then(() => callback(null)).catch((err) => callback(err));
    return;
  }

  db.run?.(query, params, (err) => callback(err || null));
}

export function archiveHabit(
  db: ExpoSQLiteDatabaseLike,
  id: number,
  callback: (err: Error | null) => void
): void {
  const query = 'UPDATE habits SET is_archived = 1, updated_at = ? WHERE id = ?';
  const params = [new Date().toISOString(), id];

  if (typeof db.runAsync === 'function') {
    db.runAsync(query, ...params).then(() => callback(null)).catch((err) => callback(err));
    return;
  }

  db.run?.(query, params, (err) => callback(err || null));
}
