import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { AppProviders } from './src/app/providers/AppProviders';
import { RootNavigator } from './src/app/navigation/RootNavigator';
import { migrateDb } from './src/data/db/client';
import { bootstrapSeedData } from './src/data/db/bootstrap';
import { useAppStore } from './src/state/useAppStore';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const setBootstrapped = useAppStore(state => state.setBootstrapped);

  useEffect(() => {
    migrateDb()
      .then(() => bootstrapSeedData())
      .then(() => setBootstrapped(true))
      .catch(error => {
        console.error('DB bootstrap failed', error);
      });
  }, [setBootstrapped]);

  return (
    <AppProviders>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <RootNavigator />
    </AppProviders>
  );
}

export default App;
