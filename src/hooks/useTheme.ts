import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Tenta recuperar do localStorage
    const savedTheme = localStorage.getItem('flowchart-theme') as Theme;
    return savedTheme || 'light';
  });

  useEffect(() => {
    // Salva no localStorage
    localStorage.setItem('flowchart-theme', theme);
    
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
