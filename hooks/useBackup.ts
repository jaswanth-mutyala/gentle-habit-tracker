import { useState, useCallback } from 'react';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as SQLite from 'expo-sqlite';
import * as SecureStore from 'expo-secure-store';
import { encrypt } from '../utils/encryption';

interface BackupData {
  habits: any[];
  completions: any[];
  settings: any[];
  exportDate: string;
}

export function useBackup(db: SQLite.SQLiteDatabase | null) {
  const [isExporting, setIsExporting] = useState(false);

  const csvEscape = (value: unknown) => {
    const text = String(value ?? '');
    return `"${text.replace(/"/g, '""')}"`;
  };

  const exportCSV = useCallback(async () => {
    if (!db) return;

    setIsExporting(true);
    try {
      const rows = await db.getAllAsync(`
        SELECT h.id AS habit_id, h.name AS habit_name, c.date, c.status, c.duration_logged
        FROM completions c
        JOIN habits h ON h.id = c.habit_id
        ORDER BY c.date DESC, h.sort_order, h.id
      `);

      const csvLines = ['habit_id,habit_name,date,status,duration_logged'];
      rows.forEach((row: any) => {
        csvLines.push(
          [
            row.habit_id,
            csvEscape(row.habit_name),
            row.date,
            row.status,
            row.duration_logged,
          ].join(',')
        );
      });

      const csv = csvLines.join('\n');
      const filePath = (FileSystem as any).documentDirectory + `gentle-habits-export-${Date.now()}.csv`;

      await FileSystem.writeAsStringAsync(filePath, csv);
      await Sharing.shareAsync(filePath);

      return filePath;
    } finally {
      setIsExporting(false);
    }
  }, [db]);

  const createEncryptedBackup = useCallback(
    async (encryptionKey?: string) => {
      if (!db) return;

      let key = encryptionKey || (await SecureStore.getItemAsync('gentle_backup_key'));
      if (!key) {
        key = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        await SecureStore.setItemAsync('gentle_backup_key', key);
      }

      const habits = await db.getAllAsync('SELECT * FROM habits');

      const completions = await db.getAllAsync('SELECT * FROM completions');

      const settings = await db.getAllAsync('SELECT * FROM settings');

      const backup: BackupData = {
        habits,
        completions,
        settings,
        exportDate: new Date().toISOString(),
      };

      const json = JSON.stringify(backup);
      const encrypted = encrypt(json, key);
      const filePath = (FileSystem as any).documentDirectory + `gentle-habits-backup-${Date.now()}.gentle`;
      await FileSystem.writeAsStringAsync(filePath, encrypted);
      await Sharing.shareAsync(filePath);
      return filePath;
    },
    [db]
  );

  return { exportCSV, createEncryptedBackup, isExporting };
}
