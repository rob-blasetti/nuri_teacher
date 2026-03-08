import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentsStackParamList } from '../../../app/navigation/types';
import { StudentEntity } from '../../../types/entities';
import { listStudents } from '../../../data/repositories/studentRepository';

type NavProp = NativeStackNavigationProp<StudentsStackParamList, 'StudentList'>;
type RouteT = RouteProp<StudentsStackParamList, 'StudentList'>;

export function StudentListScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteT>();
  const [students, setStudents] = useState<StudentEntity[]>([]);

  const load = useCallback(async () => {
    const rows = await listStudents(route.params?.classId);
    setStudents(rows);
  }, [route.params?.classId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Students</Text>
      {route.params?.classId ? (
        <Text style={styles.sub}>Filtered by class: {route.params.classId}</Text>
      ) : null}
      <FlatList
        data={students}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('StudentDetail', { studentId: item.id })}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardMeta}>{item.active ? 'Active' : 'Inactive'}</Text>
          </Pressable>
        )}
      />
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
    marginBottom: 4,
  },
  sub: {
    color: '#64748B',
    marginBottom: 10,
  },
  list: { gap: 10 },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  cardMeta: {
    marginTop: 3,
    color: '#475569',
  },
});
