"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface SettingsRouterContext {
  currentRoute: string;
  push(route: string): void;
  pop(): void;
  reset(): void;
}

interface SettingsRouterProps {
  initialRoute: string;
}

const settingsRouterContext = createContext<SettingsRouterContext | null>(null);

export function SettingsRouter({
  initialRoute,
  children,
}: React.PropsWithChildren<SettingsRouterProps>) {
  const [history, setHistory] = useState<string[]>([initialRoute]);

  const push = useCallback(
    (route: string) => setHistory((s) => [...s, route]),
    [],
  );

  const pop = useCallback(
    () =>
      setHistory((s) => (s.length <= 1 ? [initialRoute] : s.slice(0, -1))),
    [initialRoute],
  );

  const reset = useCallback(
    () => setHistory([initialRoute]),
    [initialRoute],
  );

  const currentRoute = history[history.length - 1];

  const value = useMemo(
    () => ({ currentRoute, push, pop, reset }),
    [currentRoute, push, pop, reset],
  );

  return (
    <settingsRouterContext.Provider value={value}>
      {children}
    </settingsRouterContext.Provider>
  );
}

export function useSettingsRouter() {
  const ctx = useContext(settingsRouterContext);

  if (!ctx) throw new Error("No provider found for SettingsRouterContext");

  return ctx;
}
