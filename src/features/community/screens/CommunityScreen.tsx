import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useClasses } from '../context/ClassesContext';
import { AnimatedScreen } from '../../../shared/components/AnimatedScreen';
import { AppPressable } from '../../../shared/components/AppPressable';
import { LoadingCard } from '../../../shared/components/LoadingCard';
import { colors } from '../../../shared/theme/colors';
import { ClassCard } from '../components/ClassCard';
import { useAuth } from '../../auth/context/AuthContext';

export function CommunityScreen() {
  const { authSession } = useAuth();
  const { classes, isLoading, error, refreshClasses } = useClasses();

  return (
    <AnimatedScreen style={styles.container}>
      <Text style={styles.title}>Community</Text>
      <Text style={styles.subtitle}>
        Children&apos;s classes from {authSession?.community?.name ?? authSession?.user.community?.name ?? 'your community'}.
      </Text>

      {isLoading ? <LoadingCard text="Loading community classes..." /> : null}

      {error ? (
        <View style={styles.statusCard}>
          <Text style={styles.error}>{error}</Text>
          <AppPressable style={styles.retryButton} onPress={() => refreshClasses().catch(() => undefined)}>
            <Text style={styles.retryText}>Try Again</Text>
          </AppPressable>
        </View>
      ) : null}

      <FlatList
        data={classes}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.statusCard}>
              <Text style={styles.statusTitle}>No community classes yet</Text>
              <Text style={styles.statusText}>Once classes are linked to your community, they’ll show up here.</Text>
            </View>
          ) : null
        }
        renderItem={({ item, index }) => (
          <AnimatedScreen delayMs={index * 30}>
            <ClassCard classItem={item} />
          </AnimatedScreen>
        )}
      />
    </AnimatedScreen>
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
  statusTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
  },
  statusText: {
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
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
