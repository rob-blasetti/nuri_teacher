import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LessonsStackParamList } from '../../../app/navigation/types';
import { curriculumLessons } from '../data/lessonPlanContent';
import { colors } from '../../../shared/theme/colors';

type Nav = NativeStackNavigationProp<LessonsStackParamList, 'LessonList'>;

export function LessonListScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lesson Plans</Text>
      <Text style={styles.subtitle}>Select the lesson you are currently teaching to open its teaching guide.</Text>

      <FlatList
        data={curriculumLessons}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No lessons available.</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => navigation.navigate('LessonDetail', { lessonId: item.id })}>
            <View style={styles.lessonPill}>
              <Text style={styles.lessonPillText}>{item.id}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMeta}>{item.subtitle}</Text>
            </View>
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
  empty: { color: colors.textMuted, marginTop: 10 },
  card: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonPill: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonPillText: {
    flex: 1,
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  cardBody: {
    flex: 1,
    marginLeft: 14,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  cardMeta: { marginTop: 4, color: colors.textMuted },
  chevron: {
    color: colors.textSubtle,
    fontSize: 28,
    marginLeft: 12,
  },
});
