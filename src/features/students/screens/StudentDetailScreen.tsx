import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { StudentsStackParamList } from '../../../app/navigation/types';
import { StudentEntity } from '../../../types/entities';
import { getStudentById } from '../../../data/repositories/studentRepository';

type RouteT = RouteProp<StudentsStackParamList, 'StudentDetail'>;

export function StudentDetailScreen() {
  const route = useRoute<RouteT>();
  const [student, setStudent] = useState<StudentEntity | null>(null);

  useEffect(() => {
    getStudentById(route.params.studentId).then(setStudent);
  }, [route.params.studentId]);

  if (!student) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Student not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{student.name}</Text>
      <Text style={styles.meta}>Class ID: {student.classId}</Text>
      <Text style={styles.meta}>Status: {student.active ? 'Active' : 'Inactive'}</Text>
      <Text style={styles.notes}>{student.notes ?? 'No notes yet.'}</Text>
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
});
