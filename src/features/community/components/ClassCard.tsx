import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../shared/theme/colors';

type ClassCardProps = {
  classTitle: string;
  teachers: string[];
  students: string[];
};

export function ClassCard({ classTitle, teachers, students }: ClassCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{classTitle}</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Teachers</Text>
        <Text style={styles.value}>{teachers.join(', ')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Students</Text>
        <Text style={styles.value}>
          {students.length > 0 ? students.join(', ') : 'No students added yet'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 16,
  },
  title: {
    color: colors.textOnWhite,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 14,
  },
  section: {
    marginTop: 6,
  },
  label: {
    color: colors.primaryStrong,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    color: colors.textOnWhite,
    lineHeight: 22,
  },
});
