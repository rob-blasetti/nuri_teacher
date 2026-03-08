import { getDb } from '../db/client';
import { StudentEntity } from '../../types/entities';

type StudentRow = {
  id: string;
  class_id: string;
  name: string;
  notes: string | null;
  active: number;
};

function mapStudent(row: StudentRow): StudentEntity {
  return {
    id: row.id,
    classId: row.class_id,
    name: row.name,
    notes: row.notes ?? undefined,
    active: row.active === 1,
  };
}

export async function listStudents(classId?: string): Promise<StudentEntity[]> {
  const db = await getDb();
  const query = classId
    ? 'SELECT * FROM students WHERE class_id = ? ORDER BY name ASC'
    : 'SELECT * FROM students ORDER BY name ASC';
  const params = classId ? [classId] : [];
  const [result] = await db.executeSql(query, params);
  const students: StudentEntity[] = [];
  for (let i = 0; i < result.rows.length; i += 1) {
    students.push(mapStudent(result.rows.item(i) as StudentRow));
  }
  return students;
}

export async function getStudentById(studentId: string): Promise<StudentEntity | null> {
  const db = await getDb();
  const [result] = await db.executeSql('SELECT * FROM students WHERE id = ? LIMIT 1', [studentId]);
  if (result.rows.length === 0) {
    return null;
  }
  return mapStudent(result.rows.item(0) as StudentRow);
}

export async function createStudent(input: StudentEntity): Promise<void> {
  const db = await getDb();
  await db.executeSql('INSERT INTO students (id, class_id, name, notes, active) VALUES (?, ?, ?, ?, ?)', [
    input.id,
    input.classId,
    input.name,
    input.notes ?? null,
    input.active ? 1 : 0,
  ]);
}
