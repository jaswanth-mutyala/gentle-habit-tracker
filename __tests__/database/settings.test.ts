import sqlite3 from 'sqlite3';
import { getSchemaSQL } from '../../database/schema';
import { setSetting, getSetting } from '../../database/settings';

describe('settings database operations', () => {
  let db: sqlite3.Database;

  beforeEach((done) => {
    db = new sqlite3.Database(':memory:');
    db.exec(getSchemaSQL(), done);
  });

  afterEach((done) => {
    db.close(done);
  });

  it('sets and gets a setting value', (done) => {
    setSetting(db, 'theme', 'system', (err: Error | null) => {
      expect(err).toBeNull();

      getSetting(db, 'theme', (err: Error | null, value?: string | null) => {
        expect(err).toBeNull();
        expect(value).toBe('system');
        done();
      });
    });
  });

  it('returns null for missing setting', (done) => {
    getSetting(db, 'nonexistent', (err: Error | null, value?: string | null) => {
      expect(err).toBeNull();
      expect(value).toBeNull();
      done();
    });
  });
});
