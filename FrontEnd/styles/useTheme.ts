// hooks/useTheme.ts
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useTheme() {
  const [theme, setTheme] = useState({ textColor: '#000', background: '#fff' });



  //Get theme from saved local storage
  useEffect(() => {
    const loadTheme = async () => {
      const saved = await AsyncStorage.getItem('theme');
      if (saved) {
        setTheme(JSON.parse(saved));
      }
    };
    loadTheme();
  }, []);

  const updateTheme = async (newTheme: { textColor: string, background: string }) => {
    setTheme(newTheme);
    await AsyncStorage.setItem('theme', JSON.stringify(newTheme));
  };

  return { theme, updateTheme }; // return both
}
