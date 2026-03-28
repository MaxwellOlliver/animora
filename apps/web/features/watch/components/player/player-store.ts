import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PlayerSettings = {
  volume: number;
  autoSkip: boolean;
  quality: string;
  updateSettings: (partial: Partial<Omit<PlayerSettings, "updateSettings">>) => void;
};

export const usePlayerSettings = create<PlayerSettings>()(
  persist(
    (set) => ({
      volume: 1,
      autoSkip: false,
      quality: "auto",
      updateSettings: (partial) => set(partial),
    }),
    { name: "animora:player" },
  ),
);

export const updateSettings = usePlayerSettings.getState().updateSettings;
export const getSnapshot = () => usePlayerSettings.getState();
