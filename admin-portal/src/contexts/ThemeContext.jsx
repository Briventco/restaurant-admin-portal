import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const location = useLocation();
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('theme') || 'light';
  });

  const isAppRoute = location.pathname !== '/' && 
    location.pathname !== '/waitlist' &&
    location.pathname !== '/pricing' &&
    !location.pathname.startsWith('/login') &&
    location.pathname !== '/forgot-password' &&
    location.pathname !== '/reset-password' &&
    location.pathname !== '/restaurant-signup';

  useEffect(() => {
    if (isAppRoute) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme, isAppRoute]);

  const toggleTheme = () => {
    if (isAppRoute) {
      setTheme(t => (t === 'dark' ? 'light' : 'dark'));
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isAppRoute }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};