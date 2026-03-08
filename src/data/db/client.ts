import SQLite from 'react-native-sqlite-storage';
import { DB_NAME, schemaStatements } from './schema';

SQLite.enablePromise(true);

export async function getDb() {
  const db = await SQLite.openDatabase({ name: DB_NAME, location: 'default' });
  return db;
}

export async function migrateDb() {
  const db = await getDb();
  for (const statement of schemaStatements) {
    await db.executeSql(statement);
  }
  return db;
}
