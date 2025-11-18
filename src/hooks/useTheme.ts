import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

const getPreferredTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  try {
    const savedTheme = window.localStorage?.getItem('flowchart-theme') as Theme | null;
    return savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : 'light';
  } catch (error) {
    console.warn('Não foi possível acessar o localStorage para obter o tema:', error);
    return 'light';
  }
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(getPreferredTheme);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage?.setItem('flowchart-theme', theme);
    } catch (error) {
      console.warn('Não foi possível salvar o tema no localStorage:', error);
    }

    // Atualiza a classe no document root
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme };
};
