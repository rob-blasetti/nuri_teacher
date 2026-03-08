import React, { useEffect } from 'react';
import { ActivityIndicator, Platform, StatusBar, StyleSheet, View, useColorScheme } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppProviders } from './src/app/providers/AppProviders';
import { RootNavigator } from './src/app/navigation/RootNavigator';
import { migrateDb } from './src/data/db/client';
import { bootstrapSeedData } from './src/data/db/bootstrap';
import { useAuth } from './src/features/auth/context/AuthContext';
import { SignInScreen } from './src/features/auth/screens/SignInScreen';
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

  useEffect(() => {
    if (Platform.OS === 'ios') {
      Ionicons.loadFont().catch(error => {
        console.error('Ionicons font load failed', error);
      });
    }

    migrateDb()
      .then(() => bootstrapSeedData())
      .then(() => setBootstrapped(true))
      .catch(error => {
        console.error('DB bootstrap failed', error);
      });
  }, [setBootstrapped]);

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
