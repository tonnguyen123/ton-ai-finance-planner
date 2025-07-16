// FrontEnd/styles/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Theme {
  textColor: string;
  background: string;
}

interface ThemeContextType {
  theme: Theme;
  updateTheme: (theme: Theme) => Promise<void>;
  fetchTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>({ textColor: '#000', background: '#fff' });

  const fetchTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem('theme');
      if (saved) {
        setTheme(JSON.parse(saved));
      }
    } catch (e) {
      console.log('Error loading theme:', e);
    }
  };

  const updateTheme = async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem('theme', JSON.stringify(newTheme));
      setTheme(newTheme);
    } catch (e) {
      console.log('Error saving theme:', e);
    }
  };

  useEffect(() => {
    fetchTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, fetchTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside a ThemeProvider');
  return context;
};
