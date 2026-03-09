import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentsStackParamList } from '../../../app/navigation/types';
import { colors } from '../../../shared/theme/colors';
import { useClasses } from '../../community/context/ClassesContext';

type NavProp = NativeStackNavigationProp<StudentsStackParamList, 'StudentList'>;

type LiveStudentItem = {
  id: string;
  name: string;
  classIds: string[];
  classNames: string[];
};

export function StudentListScreen() {
  const navigation = useNavigation<NavProp>();
  const { myClasses } = useClasses();

  const students = useMemo<LiveStudentItem[]>(() => {
    const studentMap = new Map<string, LiveStudentItem>();

    for (const classItem of myClasses) {
      classItem.participantIds.forEach((participantId, index) => {
        const participantName = classItem.participants[index] ?? 'Unnamed student';
        const existing = studentMap.get(participantId);

        if (existing) {
          if (!existing.classIds.includes(classItem.id)) {
            existing.classIds.push(classItem.id);
          }
          if (!existing.classNames.includes(classItem.name)) {
            existing.classNames.push(classItem.name);
          }
          if (!existing.name || existing.name === 'Unnamed student') {
            existing.name = participantName;
          }
          return;
        }

        studentMap.set(participantId, {
          id: participantId,
          name: participantName,
          classIds: [classItem.id],
          classNames: [classItem.name],
        });
      });
    }

    return Array.from(studentMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [myClasses]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Students</Text>
      <Text style={styles.sub}>Students pulled from the participants in your live classes.</Text>

      <FlatList
        data={students}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No students found in your classes yet.</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('StudentDetail', { studentId: item.id })}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardMeta}>{item.classNames.join(' • ') || 'Class not assigned yet'}</Text>
            <Text style={styles.cardMetaSecondary}>ID: {item.id}</Text>
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
    marginBottom: 4,
  },
  sub: {
    color: colors.textMuted,
    marginBottom: 10,
    lineHeight: 20,
  },
  list: { gap: 10 },
  empty: {
    color: colors.textMuted,
    marginTop: 10,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textOnWhite,
  },
  cardMeta: {
    marginTop: 5,
    color: colors.textMuted,
  },
  cardMetaSecondary: {
    marginTop: 4,
    color: colors.textSoft,
    fontSize: 12,
  },
});
