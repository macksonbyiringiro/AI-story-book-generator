
import { useState, useEffect, useCallback } from 'react';
import { Theme } from '../types';

export const useTheme = (): [Theme, (theme: Theme) => void] => {
  const getInitialTheme = (): Theme => {
    if (typeof window !== 'undefined') {
      const storedTheme = window.localStorage.getItem('theme') as Theme;
      if (storedTheme && ['light', 'dark'].includes(storedTheme)) {
        return storedTheme;
      }
    }
    return 'system';
  };
  
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  const applyTheme = useCallback((selectedTheme: Theme) => {
    const root = window.document.documentElement;
    
    if (selectedTheme === 'dark' || (selectedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
        if (theme === 'system') {
            applyTheme('system');
        }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);

  const setTheme = (newTheme: Theme) => {
    window.localStorage.setItem('theme', newTheme);
    setThemeState(newTheme);
    applyTheme(newTheme);
  };

  return [theme, setTheme];
};
