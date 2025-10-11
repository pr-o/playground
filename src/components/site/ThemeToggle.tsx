'use client';

import { useCallback, useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const THEME_STORAGE_KEY = 'theme-preference';
type ThemeMode = 'light' | 'dark';

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode | null>(null);

  const applyTheme = useCallback((next: ThemeMode) => {
    if (typeof document === 'undefined') {
      return;
    }
    const root = document.documentElement;
    root.classList.toggle('dark', next === 'dark');
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    if (stored) {
      applyTheme(stored);
      setTheme(stored);
      return;
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = prefersDark ? 'dark' : 'light';
    applyTheme(initial);
    setTheme(initial);
  }, [applyTheme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      if (!current) {
        return current;
      }
      const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      return next;
    });
  }, [applyTheme]);

  const isDark = theme === 'dark';

  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      onClick={toggleTheme}
      disabled={theme === null}
      className="relative cursor-pointer hover:bg-muted focus-visible:ring-foreground disabled:cursor-not-allowed"
    >
      <Sun
        className={cn(
          'absolute h-4 w-4 transition-all duration-200',
          isDark ? 'scale-0 opacity-0 rotate-90' : 'scale-100 opacity-100 rotate-0',
        )}
      />
      <Moon
        className={cn(
          'absolute h-4 w-4 transition-all duration-200',
          isDark ? 'scale-100 opacity-100 rotate-0' : 'scale-0 opacity-0 -rotate-90',
        )}
      />
      <span className="sr-only">
        {theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      </span>
    </Button>
  );
}
