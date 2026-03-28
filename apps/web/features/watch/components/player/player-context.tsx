"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useMediaRemote } from "@vidstack/react";
import { getSnapshot } from "./player-store";

interface PlayerContextValue {
  settingsOpen: boolean;
  toggleSettings: () => void;
  closeSettings: () => void;
}

const playerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const remote = useMediaRemote();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const stored = getSnapshot();
    remote.changeVolume(stored.volume);
    if (stored.muted) remote.mute();
  }, [remote]);

  const toggleSettings = useCallback(() => {
    setSettingsOpen((prev) => {
      if (prev) remote.resumeControls();
      else remote.pauseControls();
      return !prev;
    });
  }, [remote]);

  const closeSettings = useCallback(() => {
    setSettingsOpen(false);
    remote.resumeControls();
  }, [remote]);

  const value = useMemo(
    () => ({ settingsOpen, toggleSettings, closeSettings }),
    [settingsOpen, toggleSettings, closeSettings],
  );

  return (
    <playerContext.Provider value={value}>{children}</playerContext.Provider>
  );
}

export function usePlayerContext() {
  const ctx = useContext(playerContext);
  if (!ctx)
    throw new Error("usePlayerContext must be used within PlayerProvider");
  return ctx;
}
