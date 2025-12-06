import React, { createContext, useContext, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import { DarkTheme as NavigationDark, DefaultTheme as NavigationLight } from '@react-navigation/native';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const systemDark = Appearance.getColorScheme() === 'dark';
  const [dark, setDark] = useState(systemDark);

  const value = useMemo(() => {
    const theme = dark ? 'dark' : 'light';
    const navigationTheme = dark ? NavigationDark : NavigationLight;
    return { dark, setDark, theme, navigationTheme };
  }, [dark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeRecolhe() {
  return useContext(ThemeContext);
}
