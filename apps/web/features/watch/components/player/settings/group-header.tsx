"use client";

import { ChevronLeft } from "lucide-react";

import { useSettingsRouter } from "./router";

interface SettingsGroupHeaderProps {
  title: string;
  withGoBack?: boolean;
}

export function SettingsGroupHeader({
  title,
  withGoBack = false,
}: SettingsGroupHeaderProps) {
  const { pop } = useSettingsRouter();

  if (withGoBack) {
    return (
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-md px-2 py-2 text-foreground-muted transition-colors duration-200 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring outline-none"
        onClick={pop}
        aria-label={`Back to previous settings`}
      >
        <ChevronLeft className="size-4" />
        <span className="text-sm font-medium">{title}</span>
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 px-2 py-2">
      <span className="text-sm font-medium text-foreground-muted">{title}</span>
    </div>
  );
}
