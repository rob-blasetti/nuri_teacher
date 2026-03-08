import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { listClasses } from '../../../data/repositories/classRepository';
import { listStudents } from '../../../data/repositories/studentRepository';
import { ClassEntity, StudentEntity } from '../../../types/entities';
import { colors } from '../../../shared/theme/colors';
import { ClassCard } from '../components/ClassCard';
import { getTeachersForClass } from '../data/communityRoster';

type CommunityClassCard = {
  id: string;
  classTitle: string;
  teachers: string[];
  students: string[];
};

export function CommunityScreen() {
  const [classCards, setClassCards] = useState<CommunityClassCard[]>([]);

  const load = useCallback(async () => {
    const [classes, students] = await Promise.all([listClasses(), listStudents()]);
    const cards = buildCommunityClassCards(classes, students);
    setClassCards(cards);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Community</Text>
      <Text style={styles.subtitle}>See every class in the community together with its teachers and students.</Text>

      <FlatList
        data={classCards}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No community classes available yet.</Text>}
        renderItem={({ item }) => (
          <ClassCard classTitle={item.classTitle} teachers={item.teachers} students={item.students} />
        )}
      />
    </View>
  );
}

function buildCommunityClassCards(classes: ClassEntity[], students: StudentEntity[]): CommunityClassCard[] {
  return classes.map(classItem => ({
    id: classItem.id,
    classTitle: classItem.name,
    teachers: getTeachersForClass(classItem.id),
    students: students.filter(student => student.classId === classItem.id && student.active).map(student => student.name),
  }));
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
    marginBottom: 12,
  },
  list: {
    gap: 12,
    paddingBottom: 24,
  },
  empty: {
    color: colors.textMuted,
    marginTop: 10,
  },
});
