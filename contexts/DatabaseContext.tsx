import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as SQLite from 'expo-sqlite';
import { getSchemaSQL } from '../database/schema';
import { runMigrations } from '../database/migrations';
import { seedDefaults } from '../database/seeds';

interface DatabaseContextType {
  db: SQLite.SQLiteDatabase | null;
  isReady: boolean;
}

const DatabaseContext = createContext<DatabaseContextType>({
  db: null,
  isReady: false,
});

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initDb = async () => {
      try {
        const database = await SQLite.openDatabaseAsync('gentle.db');
        await database.execAsync(getSchemaSQL());
        await runMigrations(database);
        await seedDefaults(database);
        setDb(database);
      } catch (error) {
        console.warn('Database initialization failed:', error);
      } finally {
        setIsReady(true);
      }
    };
    initDb();
  }, []);

  return (
    <DatabaseContext.Provider value={{ db, isReady }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  return context;
}
