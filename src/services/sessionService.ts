import {
  ClassSession,
  AttendanceRecord,
  createOrGetTodaySession,
  getSessionById,
  listAttendanceBySession,
  listSessionsByClass,
  updateSessionNotes,
  upsertAttendance,
} from '../data/repositories/attendanceRepository';

export async function getOrCreateTodayClassSession(classId: string): Promise<string> {
  return createOrGetTodaySession(classId);
}

export async function getClassSessions(classId: string): Promise<ClassSession[]> {
  return listSessionsByClass(classId);
}

export async function getClassSession(sessionId: string): Promise<ClassSession | undefined> {
  return getSessionById(sessionId);
}

export async function getSessionAttendance(sessionId: string): Promise<AttendanceRecord[]> {
  return listAttendanceBySession(sessionId);
}

export async function saveSessionNotes(input: { sessionId: string; notes?: string }) {
  return updateSessionNotes(input.sessionId, input.notes);
}

export async function saveSessionAttendance(input: {
  sessionId: string;
  studentId: string;
  status: 'present' | 'absent' | 'late';
  note?: string;
}) {
  return upsertAttendance(input);
}
