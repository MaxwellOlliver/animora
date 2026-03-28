"use client";

import { useEffect, useRef } from "react";
import { useMediaState, useMediaRemote } from "@vidstack/react";
import { usePlayerContext } from "./player-context";
import { usePlayerSettings } from "./player-store";

export type TimestampAction = {
  /** Label shown on the button, e.g. "skip opening" */
  label: string;
  /** Time (seconds) when the button appears */
  startTime: number;
  /** Time (seconds) when the button disappears */
  endTime: number;
  /** Time (seconds) to seek to when clicked */
  skipTo: number;
};

type PlayerSkipButtonProps = {
  actions: TimestampAction[];
};

export function PlayerSkipButton({ actions }: PlayerSkipButtonProps) {
  const currentTime = useMediaState("currentTime");
  const remote = useMediaRemote();
  const { settingsOpen } = usePlayerContext();
  const { autoSkip } = usePlayerSettings();
  const lastAutoSkippedRef = useRef<TimestampAction | null>(null);

  const active = actions.find(
    (a) => currentTime >= a.startTime && currentTime < a.endTime,
  );

  useEffect(() => {
    if (autoSkip && active && active !== lastAutoSkippedRef.current) {
      lastAutoSkippedRef.current = active;
      remote.seek(active.skipTo);
    }
    if (!active) {
      lastAutoSkippedRef.current = null;
    }
  }, [autoSkip, active, remote]);

  if (!active || settingsOpen || autoSkip) return null;

  return (
    <button
      type="button"
      onClick={() => remote.seek(active.skipTo)}
      className="absolute bottom-20 right-4 z-10 rounded-md border border-white/20 bg-black/70 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20"
    >
      {active.label}
    </button>
  );
}
