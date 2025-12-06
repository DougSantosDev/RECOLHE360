import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Routes from './src/Routes';
import { UserProvider } from './src/context/UsarContext';
import { ThemeProvider, useThemeRecolhe } from './src/context/ThemeContext';

function ThemedNavigation() {
  const { navigationTheme } = useThemeRecolhe();
  return (
    <NavigationContainer theme={navigationTheme}>
      <Routes />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <ThemedNavigation />
      </UserProvider>
    </ThemeProvider>
  );
}
