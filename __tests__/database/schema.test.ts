import sqlite3 from 'sqlite3';
import { getSchemaSQL } from '../../database/schema';

describe('database schema', () => {
  it('creates habits, completions, and settings tables', (done) => {
    const db = new sqlite3.Database(':memory:');

    db.exec(getSchemaSQL(), (err) => {
      expect(err).toBeNull();

      // Check that tables exist
      db.all(
        "SELECT name FROM sqlite_master WHERE type='table'",
        (err, tables) => {
          expect(err).toBeNull();
          const tableNames = tables.map((t: any) => t.name);
          expect(tableNames).toContain('habits');
          expect(tableNames).toContain('completions');
          expect(tableNames).toContain('settings');
          db.close();
          done();
        }
      );
    });
  });
});
