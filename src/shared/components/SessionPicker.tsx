import React from 'react';
import { FlatList, Pressable, StyleSheet, Text } from 'react-native';
import { ClassSession } from '../../data/repositories/attendanceRepository';

type Props = {
  sessions: ClassSession[];
  value: string;
  onChange: (sessionId: string) => void;
};

export function SessionPicker({ sessions, value, onChange }: Props) {
  return (
    <FlatList
      horizontal
      data={sessions}
      keyExtractor={item => item.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      renderItem={({ item }) => {
        const active = item.id === value;
        return (
          <Pressable
            onPress={() => onChange(item.id)}
            style={[styles.chip, active && styles.chipActive]}>
            <Text style={[styles.text, active && styles.textActive]}>{item.date}</Text>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: 4 },
  chip: {
    backgroundColor: '#E2E8F0',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: '#2563EB',
  },
  text: { color: '#0F172A', fontWeight: '600' },
  textActive: { color: 'white' },
});
