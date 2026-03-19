import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/navigation/types';
import { useClasses } from '../../community/context/ClassesContext';
import { colors } from '../../../shared/theme/colors';
import { getClassSessions, getSessionAttendance } from '../../../services/sessionService';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type RouteT = RouteProp<RootStackParamList, 'ClassSessions'>;

type SessionListItem = {
  id: string;
  date: string;
  markedCount: number;
  note?: string;
  noteCount: number;
  summaryLabel: string;
};

export function ClassSessionsScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteT>();
  const { myClasses } = useClasses();
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  const classItem = useMemo(
    () => myClasses.find(item => item.id === route.params.classId),
    [myClasses, route.params.classId],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(undefined);
      const rows = await getClassSessions(route.params.classId);
      const enriched: SessionListItem[] = [];
      for (const row of rows) {
        const attendance = await getSessionAttendance(row.id);
        const noteCount = attendance.filter(item => {
          const parsed = parsePersistedStudentNote(item.note);
          return Boolean(parsed.note);
        }).length;

        enriched.push({
          id: row.id,
          date: row.date,
          markedCount: attendance.length,
          note: row.notes,
          noteCount,
          summaryLabel: buildSessionSummaryLabel(attendance.length, noteCount),
        });
      }
      enriched.sort((a, b) => b.date.localeCompare(a.date));
      if (!cancelled) {
        setSessions(enriched);
        setIsLoading(false);
      }
    }

    load().catch(loadError => {
      if (!cancelled) {
        setSessions([]);
        setError(loadError instanceof Error ? loadError.message : 'Unable to load saved class sessions.');
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [route.params.classId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{classItem?.name ?? 'Class Sessions'}</Text>
      <Text style={styles.subtitle}>Recent locally saved class sessions.</Text>

      {isLoading ? (
        <View style={styles.statusCard}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.statusText}>Loading session history...</Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.statusCard}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={() => navigation.replace('ClassSessions', { classId: route.params.classId })}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      ) : null}

      <FlatList
        data={sessions}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !isLoading && !error ? (
            <View style={styles.statusCard}>
              <Text style={styles.statusTitle}>No saved sessions yet</Text>
              <Text style={styles.statusText}>Run and finish a class session to build history here.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('InClassMode', { classId: route.params.classId, sessionId: item.id })}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.date}</Text>
              <View style={styles.openBadge}>
                <Text style={styles.openBadgeText}>Open</Text>
              </View>
            </View>
            <Text style={styles.cardMeta}>{item.summaryLabel}</Text>
            {item.note?.trim() ? <Text style={styles.cardNote} numberOfLines={2}>{item.note.trim()}</Text> : null}
            <Text style={styles.cardFootnote}>Session ID: {item.id}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

function parsePersistedStudentNote(value?: string): { note?: string } {
  if (!value) {
    return {};
  }

  const [, ...rest] = value.split(' | ');
  const note = rest.join(' | ').trim() || undefined;
  return { note };
}

function buildSessionSummaryLabel(markedCount: number, noteCount: number): string {
  if (noteCount > 0) {
    return `Marked students: ${markedCount} • Student notes: ${noteCount}`;
  }

  return `Marked students: ${markedCount}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  subtitle: { color: colors.textMuted, marginBottom: 12 },
  list: { gap: 10, paddingBottom: 24 },
  statusCard: {
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
    gap: 10,
  },
  statusTitle: { color: colors.textPrimary, fontWeight: '700', fontSize: 18 },
  statusText: { color: colors.textMuted, textAlign: 'center' },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: { color: colors.textOnWhite, fontWeight: '700', fontSize: 16, flex: 1 },
  openBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  openBadgeText: {
    color: colors.primaryStrong,
    fontWeight: '700',
    fontSize: 12,
  },
  cardMeta: { color: colors.textSoft, marginTop: 8 },
  cardNote: { color: colors.textOnWhite, marginTop: 8, lineHeight: 18, opacity: 0.75 },
  cardFootnote: { color: colors.textMuted, marginTop: 10, fontSize: 12 },
  errorText: { color: colors.danger, textAlign: 'center', lineHeight: 20 },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  retryButtonText: { color: colors.white, fontWeight: '700' },
});
