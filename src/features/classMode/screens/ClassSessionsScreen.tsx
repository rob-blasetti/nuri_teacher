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
};

export function ClassSessionsScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteT>();
  const { myClasses } = useClasses();
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const classItem = useMemo(
    () => myClasses.find(item => item.id === route.params.classId),
    [myClasses, route.params.classId],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      const rows = await getClassSessions(route.params.classId);
      const enriched: SessionListItem[] = [];
      for (const row of rows) {
        const attendance = await getSessionAttendance(row.id);
        enriched.push({
          id: row.id,
          date: row.date,
          markedCount: attendance.length,
          note: row.notes,
        });
      }
      enriched.sort((a, b) => b.date.localeCompare(a.date));
      if (!cancelled) {
        setSessions(enriched);
        setIsLoading(false);
      }
    }

    load().catch(() => {
      if (!cancelled) {
        setSessions([]);
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

      <FlatList
        data={sessions}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !isLoading ? (
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
            <Text style={styles.cardTitle}>{item.date}</Text>
            <Text style={styles.cardMeta}>Marked students: {item.markedCount}</Text>
            {item.note?.trim() ? <Text style={styles.cardNote} numberOfLines={2}>{item.note.trim()}</Text> : null}
          </Pressable>
        )}
      />
    </View>
  );
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
  cardTitle: { color: colors.textOnWhite, fontWeight: '700', fontSize: 16 },
  cardMeta: { color: colors.textSoft, marginTop: 4 },
  cardNote: { color: colors.textOnWhite, marginTop: 8, lineHeight: 18, opacity: 0.75 },
});
