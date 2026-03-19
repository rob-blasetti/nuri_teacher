import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { StudentsStackParamList } from '../../../app/navigation/types';
import { AnimatedScreen } from '../../../shared/components/AnimatedScreen';
import { LoadingCard } from '../../../shared/components/LoadingCard';
import { colors } from '../../../shared/theme/colors';
import { useClasses } from '../../community/context/ClassesContext';
import { listAttendanceBySession, listSessionsByClass } from '../../../data/repositories/attendanceRepository';
import { useAuth } from '../../auth/context/AuthContext';
import { getStudentDetail } from '../../../services/studentService';

type RouteT = RouteProp<StudentsStackParamList, 'StudentDetail'>;

type StudentHistoryItem = {
  sessionId: string;
  className: string;
  date: string;
  status: string;
  progress?: string;
  note?: string;
};

export function StudentDetailScreen() {
  const route = useRoute<RouteT>();
  const { authSession } = useAuth();
  const { myClasses } = useClasses();
  const [history, setHistory] = useState<StudentHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isLoadingRemoteStudent, setIsLoadingRemoteStudent] = useState(false);
  const [historyError, setHistoryError] = useState<string>();
  const [remoteStudentError, setRemoteStudentError] = useState<string>();
  const [remoteStudent, setRemoteStudent] = useState<{
    id: string;
    name: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
    classes: Array<{ id: string; name: string }>;
  }>();

  const localStudent = useMemo(() => {
    const matches = myClasses
      .filter(classItem => classItem.participantIds.includes(route.params.studentId))
      .map(classItem => ({
        classId: classItem.id,
        className: classItem.name,
        name:
          classItem.participants[classItem.participantIds.indexOf(route.params.studentId)] ?? 'Unnamed student',
      }));

    if (matches.length === 0) {
      return undefined;
    }

    return {
      id: route.params.studentId,
      name: matches[0].name,
      classes: matches,
    };
  }, [myClasses, route.params.studentId]);

  useEffect(() => {
    let cancelled = false;

    async function loadStudentDetail() {
      if (!authSession?.token || authSession.token === 'guest-session') {
        setRemoteStudent(undefined);
        setRemoteStudentError(undefined);
        setIsLoadingRemoteStudent(false);
        return;
      }

      setIsLoadingRemoteStudent(true);
      setRemoteStudentError(undefined);

      try {
        const detail = await getStudentDetail(authSession.token, route.params.studentId);
        if (!cancelled) {
          setRemoteStudent(detail);
        }
      } catch (error) {
        if (!cancelled) {
          setRemoteStudent(undefined);
          setRemoteStudentError(error instanceof Error ? error.message : 'Unable to load student details from the server.');
        }
      } finally {
        if (!cancelled) {
          setIsLoadingRemoteStudent(false);
        }
      }
    }

    loadStudentDetail().catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [authSession?.token, route.params.studentId]);

  const student = useMemo(() => {
    if (remoteStudent) {
      return {
        id: remoteStudent.id,
        name: remoteStudent.name,
        classes: remoteStudent.classes.map(item => ({ classId: item.id, className: item.name })),
      };
    }
    return localStudent;
  }, [localStudent, remoteStudent]);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      if (!student) {
        setHistory([]);
        setHistoryError(undefined);
        setIsLoadingHistory(false);
        return;
      }

      setIsLoadingHistory(true);
      setHistoryError(undefined);
      const items: StudentHistoryItem[] = [];

      for (const classRef of student.classes) {
        const sessions = await listSessionsByClass(classRef.classId);

        for (const session of sessions) {
          const attendance = await listAttendanceBySession(session.id);
          const match = attendance.find(item => item.studentId === student.id);
          if (!match) {
            continue;
          }

          const parsed = parsePersistedNote(match.note);
          items.push({
            sessionId: session.id,
            className: classRef.className,
            date: session.date,
            status: match.status,
            progress: parsed.progress,
            note: parsed.note,
          });
        }
      }

      items.sort((a, b) => b.date.localeCompare(a.date));

      if (!cancelled) {
        setHistory(items);
        setIsLoadingHistory(false);
      }
    }

    loadHistory().catch(error => {
      if (!cancelled) {
        setHistory([]);
        setHistoryError(error instanceof Error ? error.message : 'Unable to load local session history.');
        setIsLoadingHistory(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [student]);

  if (!student && isLoadingRemoteStudent) {
    return (
      <View style={styles.emptyContainer}>
        <LoadingCard text="Pulling together student details and recent class context..." />
        <Text style={styles.title}>Loading student...</Text>
      </View>
    );
  }

  if (!student) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.title}>Student not found</Text>
        <Text style={styles.metaCentered}>This student is not currently present in your live class roster.</Text>
        {remoteStudentError ? <Text style={styles.errorText}>{remoteStudentError}</Text> : null}
      </View>
    );
  }

  return (
    <AnimatedScreen style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.title}>{student.name}</Text>
          <Text style={styles.meta}>Student ID: {student.id}</Text>
          <Text style={styles.meta}>Classes: {student.classes.map(item => item.className).join(' • ')}</Text>
          {isLoadingRemoteStudent ? <Text style={styles.infoText}>Refreshing server details...</Text> : null}
          {!isLoadingRemoteStudent && remoteStudent ? <Text style={styles.infoText}>Showing server-backed student details.</Text> : null}
          {!isLoadingRemoteStudent && !remoteStudent && authSession?.token !== 'guest-session' ? (
            <Text style={styles.infoText}>Using local class roster data for now.</Text>
          ) : null}
          {remoteStudentError && localStudent ? <Text style={styles.warningText}>Server detail unavailable. Showing local class data.</Text> : null}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Current Classes</Text>
          {student.classes.map(classItem => (
            <View key={classItem.classId} style={styles.classRow}>
              <Text style={styles.className}>{classItem.className}</Text>
              <Text style={styles.classId}>{classItem.classId}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Recent Session History</Text>
          <Text style={styles.sectionSubtitle}>Pulled from your locally saved in-class session summaries.</Text>

          {isLoadingHistory ? <LoadingCard text="Loading saved session history..." /> : null}

          {!isLoadingHistory && historyError ? <Text style={styles.errorText}>{historyError}</Text> : null}

          {!isLoadingHistory && !historyError && history.length === 0 ? (
            <Text style={styles.empty}>No saved session history for this student yet.</Text>
          ) : null}

          {history.map((item, index) => (
            <AnimatedScreen key={`${item.sessionId}-${item.className}`} delayMs={index * 22}>
              <View style={styles.historyCard}>
                <Text style={styles.historyClass}>{item.className}</Text>
                <Text style={styles.historyMeta}>{item.date} • {item.status}</Text>
                {item.progress ? <Text style={styles.historyProgress}>Progress: {formatProgress(item.progress)}</Text> : null}
                {item.note ? <Text style={styles.historyNote}>{item.note}</Text> : null}
              </View>
            </AnimatedScreen>
          ))}
        </View>
      </ScrollView>
    </AnimatedScreen>
  );
}

function parsePersistedNote(value?: string): { progress?: string; note?: string } {
  if (!value) {
    return {};
  }

  const [first, ...rest] = value.split(' | ');
  const progress = first?.startsWith('progress:') ? first.replace('progress:', '') : undefined;
  const note = rest.join(' | ').trim() || undefined;
  return { progress, note };
}

function formatProgress(value: string): string {
  return value.replace(/-/g, ' ');
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  hero: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  meta: {
    fontSize: 14,
    color: colors.textSoft,
    marginBottom: 4,
  },
  metaCentered: {
    fontSize: 14,
    color: colors.textSoft,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  infoText: {
    marginTop: 8,
    color: colors.textSubtle,
    lineHeight: 20,
  },
  warningText: {
    marginTop: 8,
    color: colors.warning,
    lineHeight: 20,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textOnWhite,
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: colors.textMuted,
    marginBottom: 12,
  },
  classRow: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorderSoft,
  },
  className: {
    color: colors.textOnWhite,
    fontWeight: '700',
  },
  classId: {
    color: colors.textSoft,
    marginTop: 4,
    fontSize: 12,
  },
  loader: {
    marginVertical: 12,
  },
  empty: {
    color: colors.textMuted,
  },
  errorText: {
    color: colors.danger,
    lineHeight: 20,
  },
  historyCard: {
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorderSoft,
    paddingTop: 12,
    paddingBottom: 4,
  },
  historyClass: {
    color: colors.textOnWhite,
    fontWeight: '700',
  },
  historyMeta: {
    color: colors.textSoft,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  historyProgress: {
    color: colors.primaryStrong,
    marginTop: 6,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  historyNote: {
    color: colors.textMuted,
    marginTop: 6,
    lineHeight: 20,
  },
});
