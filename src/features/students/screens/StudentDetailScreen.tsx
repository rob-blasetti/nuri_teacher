import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { StudentsStackParamList } from '../../../app/navigation/types';
import { colors } from '../../../shared/theme/colors';
import { useClasses } from '../../community/context/ClassesContext';
import { listAttendanceBySession, listSessionsByClass } from '../../../data/repositories/attendanceRepository';

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
  const { myClasses } = useClasses();
  const [history, setHistory] = useState<StudentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const student = useMemo(() => {
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

    async function loadHistory() {
      if (!student) {
        setHistory([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
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
        setIsLoading(false);
      }
    }

    loadHistory().catch(() => {
      if (!cancelled) {
        setHistory([]);
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [student]);

  if (!student) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Student not found</Text>
        <Text style={styles.meta}>This student is not currently present in your live class roster.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.title}>{student.name}</Text>
        <Text style={styles.meta}>Student ID: {student.id}</Text>
        <Text style={styles.meta}>Classes: {student.classes.map(item => item.className).join(' • ')}</Text>
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

        {isLoading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}

        {!isLoading && history.length === 0 ? (
          <Text style={styles.empty}>No saved session history for this student yet.</Text>
        ) : null}

        {history.map(item => (
          <View key={`${item.sessionId}-${item.className}`} style={styles.historyCard}>
            <Text style={styles.historyClass}>{item.className}</Text>
            <Text style={styles.historyMeta}>{item.date} • {item.status}</Text>
            {item.progress ? <Text style={styles.historyProgress}>Progress: {formatProgress(item.progress)}</Text> : null}
            {item.note ? <Text style={styles.historyNote}>{item.note}</Text> : null}
          </View>
        ))}
      </View>
    </ScrollView>
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
