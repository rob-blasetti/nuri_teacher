import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';
import { DB_NAME, schemaStatements } from './schema';

SQLite.enablePromise(true);

let dbPromise: Promise<SQLiteDatabase> | null = null;
let migrationPromise: Promise<SQLiteDatabase> | null = null;

export async function getDb(): Promise<SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (SQLite.openDatabase({
      name: DB_NAME,
      location: 'default',
    }) as Promise<SQLiteDatabase>).then(db => {
      if (!db) {
        throw new Error('Failed to open SQLite database');
      }
      return db;
    });
  }
  return dbPromise;
}

export async function migrateDb(): Promise<SQLiteDatabase> {
  if (!migrationPromise) {
    migrationPromise = (async () => {
      const db = await getDb();
      for (const statement of schemaStatements) {
        await db.executeSql(statement);
      }
      return db;
    })().catch(error => {
      migrationPromise = null;
      throw error;
    });
  }

  return migrationPromise;
}
