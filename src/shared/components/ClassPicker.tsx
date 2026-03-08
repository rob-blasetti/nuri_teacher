import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { ClassEntity } from '../../types/entities';
import { colors } from '../theme/colors';

type Props = {
  classes: ClassEntity[];
  value: string;
  onChange: (classId: string) => void;
};

export function ClassPicker({ classes, value, onChange }: Props) {
  return (
    <FlatList
      horizontal
      data={classes}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.row}
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => {
        const active = value === item.id;
        return (
          <Pressable
            onPress={() => onChange(item.id)}
            style={[styles.chip, active && styles.chipActive]}>
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{item.name}</Text>
          </Pressable>
        );
      }}
      ListEmptyComponent={<View><Text style={styles.empty}>No classes yet</Text></View>}
    />
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: 4 },
  chip: {
    backgroundColor: colors.surfaceBorder,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipText: { color: colors.textPrimary, fontWeight: '600' },
  chipTextActive: { color: colors.white },
  empty: { color: colors.textMuted },
});
