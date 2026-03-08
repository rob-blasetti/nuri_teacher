import React, { useEffect } from 'react';
import { ActivityIndicator, Platform, StatusBar, StyleSheet, View, useColorScheme } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppProviders } from './src/app/providers/AppProviders';
import { RootNavigator } from './src/app/navigation/RootNavigator';
import { migrateDb } from './src/data/db/client';
import { bootstrapSeedData } from './src/data/db/bootstrap';
import { useAppStore } from './src/state/useAppStore';
import { colors } from './src/shared/theme/colors';
import { SignInScreen } from './src/features/auth/screens/SignInScreen';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const isBootstrapped = useAppStore(state => state.isBootstrapped);
  const authToken = useAppStore(state => state.authToken);
  const setBootstrapped = useAppStore(state => state.setBootstrapped);
  const setAuthSession = useAppStore(state => state.setAuthSession);

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
      {authToken ? <RootNavigator /> : <SignInScreen onSignedIn={setAuthSession} />}
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
