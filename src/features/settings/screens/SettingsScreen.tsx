import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../auth/context/AuthContext';
import { colors } from '../../../shared/theme/colors';

export function SettingsScreen() {
  const { authSession, clearAuthSession } = useAuth();

  const onLogout = () => {
    clearAuthSession().catch(error => {
      console.error('Failed to clear auth session', error);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Signed in as</Text>
        <Text style={styles.value}>{authSession?.user.name ?? 'Guest'}</Text>
        <Text style={styles.meta}>{authSession?.user.email ?? 'guest@nuri.local'}</Text>
        {authSession?.community ? <Text style={styles.meta}>Community: {authSession.community.name}</Text> : null}
      </View>

      <Pressable style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </Pressable>
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
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  label: {
    color: colors.textMuted,
    marginBottom: 6,
  },
  value: {
    color: colors.textOnWhite,
    fontSize: 18,
    fontWeight: '700',
  },
  meta: {
    color: '#475467',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: colors.danger,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  logoutButtonText: {
    color: colors.white,
    fontWeight: '700',
  },
});
