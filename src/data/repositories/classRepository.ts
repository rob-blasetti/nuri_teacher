import { getDb } from '../db/client';
import { ClassEntity } from '../../types/entities';

type ClassRow = {
  id: string;
  name: string;
  age_group: string;
  schedule: string | null;
  current_unit: string | null;
  notes: string | null;
};

function mapClass(row: ClassRow): ClassEntity {
  return {
    id: row.id,
    name: row.name,
    ageGroup: row.age_group,
    schedule: row.schedule ?? undefined,
    currentUnit: row.current_unit ?? undefined,
    notes: row.notes ?? undefined,
  };
}

export async function listClasses(): Promise<ClassEntity[]> {
  const db = await getDb();
  const [result] = await db.executeSql('SELECT * FROM classes ORDER BY name ASC');
  const classes: ClassEntity[] = [];
  for (let i = 0; i < result.rows.length; i += 1) {
    classes.push(mapClass(result.rows.item(i) as ClassRow));
  }
  return classes;
}

export async function getClassById(classId: string): Promise<ClassEntity | null> {
  const db = await getDb();
  const [result] = await db.executeSql('SELECT * FROM classes WHERE id = ? LIMIT 1', [classId]);
  if (result.rows.length === 0) {
    return null;
  }
  return mapClass(result.rows.item(0) as ClassRow);
}

export async function createClass(input: ClassEntity): Promise<void> {
  const db = await getDb();
  await db.executeSql(
    'INSERT INTO classes (id, name, age_group, schedule, current_unit, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [
      input.id,
      input.name,
      input.ageGroup,
      input.schedule ?? null,
      input.currentUnit ?? null,
      input.notes ?? null,
    ],
  );
}
