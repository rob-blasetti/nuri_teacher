import React from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useClasses } from '../context/ClassesContext';
import { colors } from '../../../shared/theme/colors';
import { ClassCard } from '../components/ClassCard';

export function CommunityScreen() {
  const { classes, isLoading, error, refreshClasses } = useClasses();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Community</Text>
      <Text style={styles.subtitle}>See every class in the community together with its facilitators and participants.</Text>

      {isLoading ? (
        <View style={styles.statusCard}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.statusText}>Loading classes...</Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.statusCard}>
          <Text style={styles.error}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={() => refreshClasses().catch(() => undefined)}>
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
        </View>
      ) : null}

      <FlatList
        data={classes}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No community classes available yet.</Text>}
        renderItem={({ item }) => <ClassCard classItem={item} />}
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
    marginBottom: 12,
  },
  list: {
    gap: 12,
    paddingBottom: 24,
  },
  statusCard: {
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
    gap: 10,
  },
  statusText: {
    color: colors.textPrimary,
  },
  empty: {
    color: colors.textMuted,
    marginTop: 10,
  },
  error: {
    color: colors.danger,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  retryText: {
    color: colors.white,
    fontWeight: '700',
  },
});
