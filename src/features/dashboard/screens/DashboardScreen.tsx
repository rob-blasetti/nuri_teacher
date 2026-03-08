import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { listClasses } from '../../../data/repositories/classRepository';
import { listStudents } from '../../../data/repositories/studentRepository';
import { getDb } from '../../../data/db/client';
import { colors } from '../../../shared/theme/colors';

export function DashboardScreen() {
  const navigation = useNavigation<any>();
  const [nextClass, setNextClass] = useState<string>('No class set');
  const [studentCount, setStudentCount] = useState(0);
  const [needsReview, setNeedsReview] = useState(0);

  const load = useCallback(async () => {
    const [classes, students] = await Promise.all([listClasses(), listStudents()]);
    setStudentCount(students.length);
    setNextClass(classes[0] ? `${classes[0].name} • ${classes[0].schedule ?? 'No schedule'}` : 'No class set');

    const db = await getDb();
    const [result] = await db.executeSql(
      "SELECT COUNT(*) as count FROM progress_records WHERE status != 'confident'",
    );
    setNeedsReview((result.rows.item(0).count as number) || 0);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teacher Dashboard</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Next class</Text>
        <Text style={styles.value}>{nextClass}</Text>
      </View>

      <View style={styles.row}>
        <View style={[styles.card, styles.half]}>
          <Text style={styles.label}>Students</Text>
          <Text style={styles.value}>{studentCount}</Text>
        </View>
        <View style={[styles.card, styles.half]}>
          <Text style={styles.label}>Need review</Text>
          <Text style={styles.value}>{needsReview}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.button} onPress={() => navigation.navigate('ClassesStack')}>
          <Text style={styles.buttonText}>Manage Classes</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => navigation.navigate('LibraryStack')}>
          <Text style={styles.buttonText}>Open Quotes & Prayers</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => navigation.navigate('RuhiStack')}>
          <Text style={styles.buttonText}>Study Ruhi</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => navigation.navigate('LessonList')}>
          <Text style={styles.buttonText}>Lesson Planner</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  label: { color: colors.textSoft, marginBottom: 4 },
  value: { color: colors.textOnWhite, fontWeight: '700', fontSize: 16 },
  actions: { marginTop: 8, gap: 8 },
  button: { backgroundColor: colors.primary, borderRadius: 10, padding: 12, alignItems: 'center' },
  buttonText: { color: colors.white, fontWeight: '600' },
});
