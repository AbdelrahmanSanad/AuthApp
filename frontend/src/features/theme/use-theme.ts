import { useContext } from 'react';
import { ThemeContext, type ThemeContextValue } from './context';

/** Access the current theme and toggle. Must be used within <ThemeProvider>. */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
