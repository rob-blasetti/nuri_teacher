import { getDb } from '../db/client';
import { ProgressRecordEntity, ProgressStatus } from '../../types/entities';

type ProgressRow = {
  id: string;
  student_id: string;
  content_item_id: string;
  status: ProgressStatus;
  updated_at: string;
  note: string | null;
};

function mapProgress(row: ProgressRow): ProgressRecordEntity {
  return {
    id: row.id,
    studentId: row.student_id,
    contentItemId: row.content_item_id,
    status: row.status,
    updatedAt: row.updated_at,
    note: row.note ?? undefined,
  };
}

export async function listProgressByContent(contentItemId: string): Promise<ProgressRecordEntity[]> {
  const db = await getDb();
  const [result] = await db.executeSql(
    'SELECT * FROM progress_records WHERE content_item_id = ? ORDER BY updated_at DESC',
    [contentItemId],
  );

  const rows: ProgressRecordEntity[] = [];
  for (let i = 0; i < result.rows.length; i += 1) {
    rows.push(mapProgress(result.rows.item(i) as ProgressRow));
  }
  return rows;
}

export async function upsertProgress(input: {
  studentId: string;
  contentItemId: string;
  status: ProgressStatus;
  note?: string;
}): Promise<void> {
  const db = await getDb();
  const id = `${input.studentId}__${input.contentItemId}`;
  const now = new Date().toISOString();

  await db.executeSql(
    `INSERT INTO progress_records (id, student_id, content_item_id, status, updated_at, note)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       status = excluded.status,
       updated_at = excluded.updated_at,
       note = excluded.note`,
    [id, input.studentId, input.contentItemId, input.status, now, input.note ?? null],
  );
}
