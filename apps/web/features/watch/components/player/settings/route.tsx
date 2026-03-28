"use client";

import { useSettingsRouter } from "./router";

interface SettingsRoute {
  path: string;
}

export function SettingsRoute({
  path,
  children,
}: React.PropsWithChildren<SettingsRoute>) {
  const ctx = useSettingsRouter();

  if (ctx.currentRoute !== path) return null;

  return <div className="animate-in fade-in">{children}</div>;
}
