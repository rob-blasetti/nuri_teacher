import { getDb } from '../db/client';

export type AttendanceStatus = 'present' | 'absent' | 'late';

export type AttendanceRecord = {
  studentId: string;
  status: AttendanceStatus;
  note?: string;
};

export async function createOrGetTodaySession(classId: string): Promise<string> {
  const db = await getDb();
  const today = new Date().toISOString().slice(0, 10);

  const [existing] = await db.executeSql(
    'SELECT id FROM class_sessions WHERE class_id = ? AND date = ? LIMIT 1',
    [classId, today],
  );

  if (existing.rows.length > 0) {
    return existing.rows.item(0).id as string;
  }

  const sessionId = `session-${classId}-${Date.now()}`;
  await db.executeSql(
    'INSERT INTO class_sessions (id, class_id, date, title, notes) VALUES (?, ?, ?, ?, ?)',
    [sessionId, classId, today, 'Class Session', null],
  );

  return sessionId;
}

export async function listAttendanceBySession(sessionId: string): Promise<AttendanceRecord[]> {
  const db = await getDb();
  const [result] = await db.executeSql(
    'SELECT student_id, status, note FROM attendance_records WHERE session_id = ?',
    [sessionId],
  );

  const rows: AttendanceRecord[] = [];
  for (let i = 0; i < result.rows.length; i += 1) {
    const row = result.rows.item(i) as {
      student_id: string;
      status: AttendanceStatus;
      note: string | null;
    };
    rows.push({
      studentId: row.student_id,
      status: row.status,
      note: row.note ?? undefined,
    });
  }
  return rows;
}

export type ClassSession = {
  id: string;
  classId: string;
  date: string;
  title?: string;
  notes?: string;
};

export async function listSessionsByClass(classId: string): Promise<ClassSession[]> {
  const db = await getDb();
  const [result] = await db.executeSql(
    'SELECT id, class_id, date, title, notes FROM class_sessions WHERE class_id = ? ORDER BY date DESC',
    [classId],
  );

  const sessions: ClassSession[] = [];
  for (let i = 0; i < result.rows.length; i += 1) {
    const row = result.rows.item(i) as {
      id: string;
      class_id: string;
      date: string;
      title: string | null;
      notes: string | null;
    };
    sessions.push({
      id: row.id,
      classId: row.class_id,
      date: row.date,
      title: row.title ?? undefined,
      notes: row.notes ?? undefined,
    });
  }

  return sessions;
}
export async function upsertAttendance(input: {
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  note?: string;
}): Promise<void> {
  const db = await getDb();
  const id = `${input.sessionId}__${input.studentId}`;
  const now = new Date().toISOString();

  await db.executeSql(
    `INSERT INTO attendance_records (id, session_id, student_id, status, note, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       status = excluded.status,
       note = excluded.note,
       updated_at = excluded.updated_at`,
    [id, input.sessionId, input.studentId, input.status, input.note ?? null, now],
  );
}
