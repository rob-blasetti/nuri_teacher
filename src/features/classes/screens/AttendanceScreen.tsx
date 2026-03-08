import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useFocusEffect, useRoute } from '@react-navigation/native';
import { ClassesStackParamList } from '../../../app/navigation/types';
import { StudentEntity } from '../../../types/entities';
import { listStudents } from '../../../data/repositories/studentRepository';
import { colors } from '../../../shared/theme/colors';
import {
  AttendanceStatus,
  ClassSession,
  createOrGetTodaySession,
  listAttendanceBySession,
  listSessionsByClass,
  upsertAttendance,
} from '../../../data/repositories/attendanceRepository';
import { SessionPicker } from '../../../shared/components/SessionPicker';

type RouteT = RouteProp<ClassesStackParamList, 'Attendance'>;

const statuses: AttendanceStatus[] = ['present', 'late', 'absent'];

export function AttendanceScreen() {
  const route = useRoute<RouteT>();
  const [sessionId, setSessionId] = useState<string>('');
  const [students, setStudents] = useState<StudentEntity[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [sessions, setSessions] = useState<ClassSession[]>([]);

  const loadSessions = useCallback(async () => {
    const sid = await createOrGetTodaySession(route.params.classId);
    const sessionRows = await listSessionsByClass(route.params.classId);
    setSessions(sessionRows);
    setSessionId(prev => prev || sid);
  }, [route.params.classId]);

  const loadAttendance = useCallback(
    async (activeSessionId: string) => {
      const [studentRows, attendanceRows] = await Promise.all([
        listStudents(route.params.classId),
        listAttendanceBySession(activeSessionId),
      ]);

      setStudents(studentRows);
      const next: Record<string, AttendanceStatus> = {};
      attendanceRows.forEach(row => {
        next[row.studentId] = row.status;
      });
      setAttendance(next);
    },
    [route.params.classId],
  );

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (!sessionId) return;
    loadAttendance(sessionId);
  }, [sessionId, loadAttendance]);

  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [loadSessions]),
  );

  const onSet = async (studentId: string, status: AttendanceStatus) => {
    if (!sessionId) return;
    await upsertAttendance({ sessionId, studentId, status });
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const presentCount = Object.values(attendance).filter(s => s === 'present').length;
  const lateCount = Object.values(attendance).filter(s => s === 'late').length;
  const absentCount = Object.values(attendance).filter(s => s === 'absent').length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance</Text>
      <Text style={styles.subtitle}>Class session history</Text>

      <SessionPicker sessions={sessions} value={sessionId} onChange={setSessionId} />

      <View style={styles.summaryRow}>
        <Text style={styles.summary}>Present: {presentCount}</Text>
        <Text style={styles.summary}>Late: {lateCount}</Text>
        <Text style={styles.summary}>Absent: {absentCount}</Text>
      </View>

      <FlatList
        data={students}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const current = attendance[item.id];
          return (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <View style={styles.row}>
                {statuses.map(status => {
                  const active = current === status;
                  return (
                    <Pressable
                      key={status}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => onSet(item.id, status)}>
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>{status}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
  subtitle: { marginTop: 4, marginBottom: 6, color: colors.textMuted },
  summaryRow: { flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 8 },
  summary: {
    backgroundColor: colors.surfaceBorder,
    color: colors.textPrimary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    overflow: 'hidden',
    fontWeight: '600',
    fontSize: 12,
  },
  list: { gap: 10, paddingBottom: 20 },
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.surfaceBorder, borderRadius: 12, padding: 12 },
  name: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8 },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.surfaceBorderSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.background,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textSoft, fontWeight: '600', textTransform: 'capitalize' },
  chipTextActive: { color: colors.white },
});
