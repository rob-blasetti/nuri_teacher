import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../../app/navigation/types';
import { getLessonById } from '../../../data/repositories/lessonRepository';
import { colors } from '../../../shared/theme/colors';

type RouteT = RouteProp<RootStackParamList, 'InClassMode'>;

const fallbackPhrases = [
  'Truthfulness',
  'is the foundation',
  'of all human virtues',
];

export function InClassModeScreen() {
  const route = useRoute<RouteT>();
  const [lessonTitle, setLessonTitle] = useState('In-Class Mode');
  const [phrases, setPhrases] = useState<string[]>(fallbackPhrases);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!route.params.lessonId) {
      return;
    }

    getLessonById(route.params.lessonId).then(lesson => {
      if (!lesson) {
        return;
      }

      setLessonTitle(lesson.title);
      const derived = lesson.blocks.map(block => `${block.title} (${block.minutes} min)`);
      setPhrases(derived.length > 0 ? derived : fallbackPhrases);
      setCurrentIndex(0);
    });
  }, [route.params.lessonId]);

  const total = phrases.length;
  const phrase = useMemo(() => phrases[currentIndex] ?? '', [phrases, currentIndex]);

  return (
    <View style={styles.container}>
      <Text style={styles.lesson}>{lessonTitle}</Text>
      <Text style={styles.count}>Step {currentIndex + 1} / {total}</Text>

      <View style={styles.card}>
        <Text style={styles.phrase}>{phrase}</Text>
      </View>

      <View style={styles.controls}>
        <Pressable
          style={[styles.button, currentIndex === 0 && styles.buttonDisabled]}
          onPress={() => setCurrentIndex(i => Math.max(0, i - 1))}
          disabled={currentIndex === 0}>
          <Text style={styles.buttonText}>Previous</Text>
        </Pressable>
        <Pressable
          style={[styles.button, currentIndex >= total - 1 && styles.buttonDisabled]}
          onPress={() => setCurrentIndex(i => Math.min(total - 1, i + 1))}
          disabled={currentIndex >= total - 1}>
          <Text style={styles.buttonText}>Next</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 20,
    justifyContent: 'center',
  },
  lesson: {
    color: colors.highlight,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '700',
  },
  count: {
    color: colors.textSoft,
    textAlign: 'center',
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.textSoft,
    padding: 20,
    minHeight: 180,
    justifyContent: 'center',
  },
  phrase: {
    color: colors.white,
    fontSize: 28,
    lineHeight: 38,
    textAlign: 'center',
    fontWeight: '700',
  },
  controls: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.textSoft,
  },
  buttonText: {
    color: colors.white,
    fontWeight: '600',
  },
});
