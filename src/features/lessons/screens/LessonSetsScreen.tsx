import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LessonsStackParamList } from '../../../app/navigation/types';
import { getCurriculumLessonSetsByGrade } from '../data/lessonPlanContent';
import { colors } from '../../../shared/theme/colors';

type Nav = NativeStackNavigationProp<LessonsStackParamList, 'LessonSets'>;
type RouteT = RouteProp<LessonsStackParamList, 'LessonSets'>;

export function LessonSetsScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteT>();
  const grade = route.params.grade;
  const sets = getCurriculumLessonSetsByGrade(grade);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{grade} Sets</Text>
      <Text style={styles.subtitle}>Choose a set to open the lessons inside it.</Text>

      <FlatList
        data={sets}
        keyExtractor={item => item}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No sets are available for this grade yet.</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => navigation.navigate('LessonList', { grade, set: item })}>
            <Text style={styles.rowText}>{item}</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  subtitle: { color: colors.textMuted, lineHeight: 20, marginBottom: 10 },
  list: { gap: 10, paddingTop: 10, paddingBottom: 20 },
  row: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowText: { color: colors.textPrimary, fontSize: 17, fontWeight: '700' },
  chevron: { color: colors.textSubtle, fontSize: 28 },
  empty: { color: colors.textMuted, marginTop: 10 },
});
