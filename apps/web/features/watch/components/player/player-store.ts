import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PlayerSettings = {
  volume: number;
  muted: boolean;
  autoSkip: boolean;
  quality: string;
  updateSettings: (partial: Partial<Omit<PlayerSettings, "updateSettings">>) => void;
};

export const usePlayerSettings = create<PlayerSettings>()(
  persist(
    (set) => ({
      volume: 1,
      muted: false,
      autoSkip: false,
      quality: "auto",
      updateSettings: (partial) => set(partial),
    }),
    { name: "animora:player" },
  ),
);

export const updateSettings = usePlayerSettings.getState().updateSettings;
export const getSnapshot = () => usePlayerSettings.getState();
