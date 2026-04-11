import { create } from "zustand";

const STORAGE_KEY = "animora:player";

type PersistedState = Omit<PlayerSettings, "updateSettings">;

const defaults: PersistedState = {
  volume: 1,
  muted: false,
  autoPlay: false,
  autoSkip: false,
  quality: "auto",
};

function load(): PersistedState {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { state?: Partial<PersistedState> };
      return { ...defaults, ...parsed.state };
    }
  } catch {}
  return defaults;
}

function save(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state }));
  } catch {}
}

export type PlayerSettings = {
  volume: number;
  muted: boolean;
  autoPlay: boolean;
  autoSkip: boolean;
  quality: string;
  updateSettings: (
    partial: Partial<Omit<PlayerSettings, "updateSettings">>,
  ) => void;
};

const initial = load();

export const usePlayerSettings = create<PlayerSettings>()((set, get) => ({
  ...initial,
  updateSettings: (partial) => {
    set(partial);
    const { updateSettings: _, ...persisted } = get();
    save(persisted);
  },
}));

export const updateSettings = usePlayerSettings.getState().updateSettings;
export const getSnapshot = () => usePlayerSettings.getState();
