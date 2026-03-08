import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ProgressStatus } from '../../types/entities';
import { colors } from '../theme/colors';

const statusMap: Record<ProgressStatus, { bg: string; text: string; label: string }> = {
  not_started: { bg: colors.surfaceBorder, text: colors.textSoft, label: 'Not started' },
  learning: { bg: '#DBEAFE', text: '#1D4ED8', label: 'Learning' },
  partial: { bg: '#FEF3C7', text: '#92400E', label: 'Partial' },
  confident: { bg: '#DCFCE7', text: '#166534', label: 'Confident' },
};

export function StatusPill({ status }: { status: ProgressStatus }) {
  const style = statusMap[status];
  return (
    <View style={[styles.pill, { backgroundColor: style.bg }]}>
      <Text style={[styles.label, { color: style.text }]}>{style.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
