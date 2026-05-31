import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'cream');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const themes = ['cream', 'dark', 'red'];
  const cycleTheme = () => {
    setTheme(t => {
      const idx = themes.indexOf(t);
      return themes[(idx + 1) % themes.length];
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
