import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { colors } from '../constants/colors';
import { getSetting, setSetting } from '../database/settings';
import { useDatabase } from './DatabaseContext';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  paperColor: string;
  inkColor: string;
  inkLightColor: string;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  setTheme: () => {},
  isDark: false,
  paperColor: colors.paper,
  inkColor: colors.ink,
  inkLightColor: colors.inkLight,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { db, isReady } = useDatabase();
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('system');

  useEffect(() => {
    if (!db || !isReady) return;

    getSetting(db, 'theme', (_err, value) => {
      if (value === 'light' || value === 'dark' || value === 'system') {
        setThemeState(value);
      }
    });
  }, [db, isReady]);

  const isDark =
    theme === 'system' ? systemColorScheme === 'dark' : theme === 'dark';

  const paperColor = isDark ? colors.paperDark : colors.paper;
  const inkColor = isDark ? colors.paper : colors.ink;
  const inkLightColor = colors.inkLight;

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      if (db) {
        setSetting(db, 'theme', newTheme, () => {});
      }
    },
    [db]
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, paperColor, inkColor, inkLightColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
