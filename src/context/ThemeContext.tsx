"use client";

import { useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setTheme as setThemeAction, toggleTheme as toggleThemeAction } from "../store/slices/themeSlice";

type ThemeProviderProps = {
  children: ReactNode;
};

/**
 * ThemeProvider now acts as an initialiser — it reads localStorage and the
 * system preference on mount, dispatches the initial value to the Redux store,
 * and keeps the <html> class in sync with whatever the Redux theme state is.
 * The context API is no longer used; components call `useThemeContext()`.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.theme);

  // Initialise from localStorage / system preference once
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") {
      dispatch(setThemeAction(saved));
    } else {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      dispatch(setThemeAction(systemDark ? "dark" : "light"));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync <html> class and localStorage whenever theme changes
  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return <>{children}</>;
}

/**
 * Drop-in replacement for the old context-based hook.
 * Same return shape — callers need no changes.
 */
export function useThemeContext() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.theme);

  const toggleTheme = useCallback(() => {
    dispatch(toggleThemeAction());
  }, [dispatch]);

  return { theme, toggleTheme };
}
