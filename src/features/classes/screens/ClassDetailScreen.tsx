import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClassesStackParamList, TabParamList } from '../../../app/navigation/types';
import { ClassEntity } from '../../../types/entities';
import { getClassById } from '../../../data/repositories/classRepository';
import { listStudents } from '../../../data/repositories/studentRepository';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

type RouteT = RouteProp<ClassesStackParamList, 'ClassDetail'>;
type ClassNav = NativeStackNavigationProp<ClassesStackParamList, 'ClassDetail'>;
type TabNav = BottomTabNavigationProp<TabParamList>;

export function ClassDetailScreen() {
  const route = useRoute<RouteT>();
  const classNav = useNavigation<ClassNav>();
  const tabNav = useNavigation<TabNav>();

  const [classData, setClassData] = useState<ClassEntity | null>(null);
  const [studentCount, setStudentCount] = useState(0);

  const load = useCallback(async () => {
    const [classRow, students] = await Promise.all([
      getClassById(route.params.classId),
      listStudents(route.params.classId),
    ]);
    setClassData(classRow);
    setStudentCount(students.length);
  }, [route.params.classId]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (!classData) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Class not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{classData.name}</Text>
      <Text style={styles.meta}>Age Group: {classData.ageGroup}</Text>
      <Text style={styles.meta}>Schedule: {classData.schedule ?? 'Not set'}</Text>
      <Text style={styles.meta}>Current Unit: {classData.currentUnit ?? 'Not set'}</Text>
      <Text style={styles.meta}>Students: {studentCount}</Text>
      <Text style={styles.notes}>{classData.notes ?? 'No notes yet.'}</Text>

      <View style={styles.actions}>
        <Pressable
          style={styles.button}
          onPress={() =>
            tabNav.navigate('StudentsStack', {
              screen: 'StudentList',
              params: { classId: classData.id },
            } as never)
          }>
          <Text style={styles.buttonText}>View Students</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={() => classNav.navigate('Attendance', { classId: classData.id })}>
          <Text style={styles.buttonText}>Take Attendance</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.secondary]}
          onPress={() => tabNav.navigate('LibraryStack' as never)}>
          <Text style={[styles.buttonText, styles.secondaryText]}>Open Library</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  meta: {
    fontSize: 16,
    color: '#334155',
    marginBottom: 6,
  },
  notes: {
    marginTop: 8,
    color: '#475569',
  },
  actions: {
    marginTop: 20,
    gap: 10,
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  secondary: {
    backgroundColor: '#E2E8F0',
  },
  secondaryText: {
    color: '#0F172A',
  },
});
