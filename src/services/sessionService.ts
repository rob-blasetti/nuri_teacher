import {
  ClassSession,
  AttendanceRecord,
  createOrGetTodaySession,
  listAttendanceBySession,
  listSessionsByClass,
  upsertAttendance,
} from '../data/repositories/attendanceRepository';

export async function getOrCreateTodayClassSession(classId: string): Promise<string> {
  return createOrGetTodaySession(classId);
}

export async function getClassSessions(classId: string): Promise<ClassSession[]> {
  return listSessionsByClass(classId);
}

export async function getSessionAttendance(sessionId: string): Promise<AttendanceRecord[]> {
  return listAttendanceBySession(sessionId);
}

export async function saveSessionAttendance(input: {
  sessionId: string;
  studentId: string;
  status: 'present' | 'absent' | 'late';
  note?: string;
}) {
  return upsertAttendance(input);
}
