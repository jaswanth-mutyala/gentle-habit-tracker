type ExpoSQLiteDatabaseLike = {
  runAsync?: (source: string, ...params: any[]) => Promise<{ lastInsertRowId?: number }>;
  getFirstAsync?: <T>(source: string, ...params: any[]) => Promise<T | null>;
  run?: (
    source: string,
    params: any[],
    callback: (this: { lastID?: number }, err: Error | null) => void
  ) => void;
  get?: (source: string, params: any[], callback: (err: Error | null, row: any) => void) => void;
};

export function setSetting(
  db: ExpoSQLiteDatabaseLike,
  key: string,
  value: string,
  callback: (err: Error | null) => void
): void {
  if (typeof db.runAsync === 'function') {
    db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', key, value)
      .then(() => callback(null))
      .catch((err) => callback(err));
    return;
  }

  db.run?.(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`, [key, value], (err) =>
    callback(err || null)
  );
}

export function getSetting(
  db: ExpoSQLiteDatabaseLike,
  key: string,
  callback: (err: Error | null, value?: string | null) => void
): void {
  if (typeof db.getFirstAsync === 'function') {
    db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', key)
      .then((row) => callback(null, row ? row.value : null))
      .catch((err) => callback(err));
    return;
  }

  db.get?.('SELECT value FROM settings WHERE key = ?', [key], (err, row: any) => {
    callback(err || null, row ? row.value : null);
  });
}

export function getSettingAsync(db: ExpoSQLiteDatabaseLike, key: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    getSetting(db, key, (err, value) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(value || null);
    });
  });
}

export function setSettingAsync(
  db: ExpoSQLiteDatabaseLike,
  key: string,
  value: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    setSetting(db, key, value, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}
