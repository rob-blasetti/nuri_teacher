import React, { useEffect } from 'react';
import { ActivityIndicator, Platform, StatusBar, StyleSheet, View, useColorScheme } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppProviders } from './src/app/providers/AppProviders';
import { RootNavigator } from './src/app/navigation/RootNavigator';
import { migrateDb } from './src/data/db/client';
import { bootstrapSeedData } from './src/data/db/bootstrap';
import { useAuth } from './src/features/auth/context/AuthContext';
import { SignInScreen } from './src/features/auth/screens/SignInScreen';
import { getAuthSessionForToken } from './src/services/auth/authGateway';
import { clearStoredAuthSession, readStoredAuthSession, saveStoredAuthSession } from './src/services/auth/authSessionStorage';
import { useAppStore } from './src/state/useAppStore';
import { colors } from './src/shared/theme/colors';

function AppContent() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <RootNavigator /> : <SignInScreen />;
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const isBootstrapped = useAppStore(state => state.isBootstrapped);
  const setBootstrapped = useAppStore(state => state.setBootstrapped);
  const setAuthSession = useAppStore(state => state.setAuthSession);
  const clearAuthSession = useAppStore(state => state.clearAuthSession);

  useEffect(() => {
    let cancelled = false;

    async function bootstrapApp() {
      try {
        if (Platform.OS === 'ios') {
          try {
            await Ionicons.loadFont();
          } catch (error) {
            console.error('Ionicons font load failed', error);
          }
        }

        await Promise.all([bootstrapDatabase(), restoreAuthSession()]);
      } catch (error) {
        console.error('App bootstrap failed', error);
      } finally {
        if (!cancelled) {
          setBootstrapped(true);
        }
      }
    }

    async function bootstrapDatabase() {
      await migrateDb();
      await bootstrapSeedData();
    }

    async function restoreAuthSession() {
      const storedSession = await readStoredAuthSession();
      if (!storedSession) {
        return;
      }

      if (storedSession.token === 'guest-session') {
        if (!cancelled) {
          setAuthSession(storedSession);
        }
        return;
      }

      try {
        const refreshedSession = await getAuthSessionForToken(storedSession.token, {
          user: storedSession.user,
          community: storedSession.community,
        });
        await saveStoredAuthSession(refreshedSession);
        if (!cancelled) {
          setAuthSession(refreshedSession);
        }
      } catch (error) {
        await clearStoredAuthSession();
        if (!cancelled) {
          clearAuthSession();
        }
        console.error('Stored auth session restore failed', error);
      }
    }

    bootstrapApp();

    return () => {
      cancelled = true;
    };
  }, [clearAuthSession, setAuthSession, setBootstrapped]);

  if (!isBootstrapped) {
    return (
      <AppProviders>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <View style={styles.loading}>
          <ActivityIndicator color={colors.white} size="large" />
        </View>
      </AppProviders>
    );
  }

  return (
    <AppProviders>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </AppProviders>
  );
}

export default App;

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
