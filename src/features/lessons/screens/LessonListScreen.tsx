import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/navigation/types';
import { LessonPlanEntity } from '../../../types/entities';
import { listLessons } from '../../../data/repositories/lessonRepository';
import { colors } from '../../../shared/theme/colors';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function LessonListScreen() {
  const navigation = useNavigation<Nav>();
  const [lessons, setLessons] = useState<LessonPlanEntity[]>([]);

  const load = useCallback(async () => {
    const rows = await listLessons();
    setLessons(rows);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lesson Plans</Text>
      <Pressable style={styles.newBtn} onPress={() => navigation.navigate('LessonEditor')}>
        <Text style={styles.newBtnText}>+ New Lesson</Text>
      </Pressable>

      <FlatList
        data={lessons}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No lessons yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Pressable onPress={() => navigation.navigate('LessonEditor', { lessonId: item.id })}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMeta}>{item.date} • {item.classId}</Text>
            </Pressable>

            <View style={styles.actionsRow}>
              <Pressable
                style={[styles.actionBtn, styles.secondaryBtn]}
                onPress={() => navigation.navigate('LessonEditor', { lessonId: item.id })}>
                <Text style={[styles.actionText, styles.secondaryText]}>Edit</Text>
              </Pressable>
              <Pressable
                style={styles.actionBtn}
                onPress={() =>
                  navigation.navigate('InClassMode', {
                    classId: item.classId,
                    lessonId: item.id,
                  })
                }>
                <Text style={styles.actionText}>Start Class</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: colors.textPrimary, marginBottom: 10 },
  newBtn: { backgroundColor: colors.primary, borderRadius: 10, padding: 10, alignSelf: 'flex-start' },
  newBtnText: { color: colors.white, fontWeight: '600' },
  list: { gap: 10, paddingTop: 10, paddingBottom: 20 },
  empty: { color: colors.textMuted, marginTop: 10 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.textOnWhite },
  cardMeta: { marginTop: 3, color: colors.textMuted },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryBtn: {
    backgroundColor: colors.surfaceBorder,
  },
  actionText: {
    color: colors.white,
    fontWeight: '600',
  },
  secondaryText: {
    color: colors.textPrimary,
  },
});
