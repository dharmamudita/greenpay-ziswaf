import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import Colors from '../theme/colors';

const ThemeContext = createContext({});

export function ThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useState('system'); // system, light, dark
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    if (themeMode === 'system') {
      const colorScheme = Appearance.getColorScheme();
      setIsDark(colorScheme === 'dark');
      
      const subscription = Appearance.addChangeListener(({ colorScheme }) => {
        if (themeMode === 'system') {
          setIsDark(colorScheme === 'dark');
        }
      });
      return () => subscription.remove();
    } else {
      setIsDark(themeMode === 'dark');
    }
  }, [themeMode]);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('themeMode');
      if (savedTheme) {
        setThemeMode(savedTheme);
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    }
  };

  const changeTheme = async (mode) => {
    try {
      setThemeMode(mode);
      await AsyncStorage.setItem('themeMode', mode);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const activeColors = isDark ? Colors.dark : Colors.light;

  return (
    <ThemeContext.Provider value={{ themeMode, isDark, changeTheme, colors: activeColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
