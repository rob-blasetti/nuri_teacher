import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LessonsStackParamList } from '../../../app/navigation/types';
import { colors } from '../../../shared/theme/colors';

const grades = [
  { label: 'Preschool', status: 'available' },
  { label: 'Grade 1', status: 'available' },
  { label: 'Grade 2', status: 'available' },
  { label: 'Grade 3', status: 'coming-soon' },
  { label: 'Grade 4', status: 'coming-soon' },
  { label: 'Grade 5', status: 'coming-soon' },
] as const;

type GradeItem = (typeof grades)[number];
type Nav = NativeStackNavigationProp<LessonsStackParamList, 'Grades'>;

export function GradesScreen() {
  const navigation = useNavigation<Nav>();

  const onPressGrade = (item: GradeItem) => {
    if (item.status === 'coming-soon') {
      return;
    }

    if (item.label === 'Grade 2') {
      navigation.navigate('LessonSets', { grade: item.label });
      return;
    }

    navigation.navigate('LessonList', { grade: item.label });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Grades</Text>
      <Text style={styles.subtitle}>Choose a grade level to open its lessons.</Text>

      <FlatList
        data={grades}
        keyExtractor={item => item.label}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.row, item.status === 'coming-soon' ? styles.rowDisabled : null]}
            onPress={() => onPressGrade(item)}
            disabled={item.status === 'coming-soon'}>
            <View>
              <Text style={[styles.rowText, item.status === 'coming-soon' ? styles.rowTextDisabled : null]}>
                {item.label}
              </Text>
              {item.status === 'coming-soon' ? <Text style={styles.badge}>Coming Soon</Text> : null}
            </View>
            <Text style={[styles.chevron, item.status === 'coming-soon' ? styles.chevronDisabled : null]}>›</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 10,
  },
  list: {
    gap: 10,
    paddingTop: 10,
    paddingBottom: 20,
  },
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
  rowDisabled: {
    opacity: 0.72,
  },
  rowText: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  rowTextDisabled: {
    color: colors.textMuted,
  },
  badge: {
    marginTop: 6,
    color: colors.highlight,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chevron: {
    color: colors.textSubtle,
    fontSize: 28,
  },
  chevronDisabled: {
    color: colors.surfaceBorder,
  },
});
