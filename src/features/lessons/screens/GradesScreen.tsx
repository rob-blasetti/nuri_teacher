import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LessonsStackParamList } from '../../../app/navigation/types';
import { colors } from '../../../shared/theme/colors';

const grades = ['Preschool', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'];

type Nav = NativeStackNavigationProp<LessonsStackParamList, 'Grades'>;

export function GradesScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Grades</Text>
      <Text style={styles.subtitle}>Choose a grade level to open its lessons.</Text>

      <FlatList
        data={grades}
        keyExtractor={item => item}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => navigation.navigate('LessonList')}>
            <Text style={styles.rowText}>{item}</Text>
            <Text style={styles.chevron}>›</Text>
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
  rowText: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  chevron: {
    color: colors.textSubtle,
    fontSize: 28,
  },
});
