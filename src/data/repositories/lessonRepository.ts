import { getDb } from '../db/client';
import { LessonPlanEntity } from '../../types/entities';

type LessonRow = {
  id: string;
  class_id: string;
  date: string;
  title: string;
  blocks_json: string;
  checklist_json: string;
};

function mapLesson(row: LessonRow): LessonPlanEntity {
  return {
    id: row.id,
    classId: row.class_id,
    date: row.date,
    title: row.title,
    blocks: JSON.parse(row.blocks_json) as LessonPlanEntity['blocks'],
    checklist: JSON.parse(row.checklist_json) as string[],
  };
}

export async function listLessons(classId?: string): Promise<LessonPlanEntity[]> {
  const db = await getDb();
  const query = classId
    ? 'SELECT * FROM lesson_plans WHERE class_id = ? ORDER BY date DESC'
    : 'SELECT * FROM lesson_plans ORDER BY date DESC';
  const params = classId ? [classId] : [];

  const [result] = await db.executeSql(query, params);
  const rows: LessonPlanEntity[] = [];
  for (let i = 0; i < result.rows.length; i += 1) {
    rows.push(mapLesson(result.rows.item(i) as LessonRow));
  }
  return rows;
}

export async function getLessonById(lessonId: string): Promise<LessonPlanEntity | null> {
  const db = await getDb();
  const [result] = await db.executeSql('SELECT * FROM lesson_plans WHERE id = ? LIMIT 1', [lessonId]);
  if (result.rows.length === 0) {
    return null;
  }
  return mapLesson(result.rows.item(0) as LessonRow);
}

export async function createLesson(input: LessonPlanEntity): Promise<void> {
  const db = await getDb();
  await db.executeSql(
    `INSERT INTO lesson_plans (id, class_id, date, title, blocks_json, checklist_json)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       class_id = excluded.class_id,
       date = excluded.date,
       title = excluded.title,
       blocks_json = excluded.blocks_json,
       checklist_json = excluded.checklist_json`,
    [
      input.id,
      input.classId,
      input.date,
      input.title,
      JSON.stringify(input.blocks),
      JSON.stringify(input.checklist),
    ],
  );
}
