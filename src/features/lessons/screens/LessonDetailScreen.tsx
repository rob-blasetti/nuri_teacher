import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { LessonsStackParamList } from '../../../app/navigation/types';
import { getCurriculumLessonById } from '../data/lessonPlanContent';
import { colors } from '../../../shared/theme/colors';

type RouteT = RouteProp<LessonsStackParamList, 'LessonDetail'>;

export function LessonDetailScreen() {
  const route = useRoute<RouteT>();
  const lesson = getCurriculumLessonById(route.params.lessonId);

  if (!lesson) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Lesson not found</Text>
        <Text style={styles.emptyText}>Choose a lesson from the lesson plan list.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>{lesson.grade}</Text>
        <Text style={styles.title}>{lesson.title}</Text>
        <Text style={styles.summary}>{lesson.subtitle}</Text>
      </View>

      {lesson.sections.map(section => (
        <View key={`${lesson.id}-${section.key}`} style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionBody}>{section.body}</Text>
        </View>
      ))}
    </ScrollView>
  );
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
    padding: 18,
  },
  eyebrow: {
    color: colors.highlight,
    fontWeight: '700',
    marginBottom: 6,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  summary: {
    color: colors.textMuted,
    marginTop: 8,
    lineHeight: 20,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  sectionTitle: {
    color: colors.textOnWhite,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionBody: {
    color: colors.textOnWhite,
    lineHeight: 21,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  emptyText: {
    color: colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
});
