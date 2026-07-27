import { create } from "zustand";

import type { OverlayMessage } from "./overlay-messages";
import type { TimestampAction } from "./skip-button";

type LoadParams = {
  episodeId: string;
  src: string;
  title?: string;
  nextEpisodeId?: string | null;
  timestampActions?: TimestampAction[];
  initialTimeSeconds: number;
};

type MiniplayerState = {
  episodeId: string | null;
  src: string | null;
  title: string | undefined;
  nextEpisodeId: string | null | undefined;
  timestampActions: TimestampAction[];
  initialTimeSeconds: number;
  overlayMessages: OverlayMessage[];

  slotEl: HTMLDivElement | null;
  slotOwnerId: string | null;

  load: (params: LoadParams) => void;
  setOverlayMessages: (messages: OverlayMessage[]) => void;
  registerSlot: (el: HTMLDivElement, ownerId: string) => void;
  unregisterSlot: (ownerId: string) => void;
  close: () => void;
};

export const useMiniplayerStore = create<MiniplayerState>()((set) => ({
  episodeId: null,
  src: null,
  title: undefined,
  nextEpisodeId: null,
  timestampActions: [],
  initialTimeSeconds: 0,
  overlayMessages: [],

  slotEl: null,
  slotOwnerId: null,

  load: ({
    episodeId,
    src,
    title,
    nextEpisodeId,
    timestampActions = [],
    initialTimeSeconds,
  }) =>
    set({
      episodeId,
      src,
      title,
      nextEpisodeId,
      timestampActions,
      initialTimeSeconds,
      overlayMessages: [],
    }),

  setOverlayMessages: (overlayMessages) => set({ overlayMessages }),

  registerSlot: (el, ownerId) => set({ slotEl: el, slotOwnerId: ownerId }),

  unregisterSlot: (ownerId) =>
    set((state) =>
      state.slotOwnerId === ownerId
        ? { slotEl: null, slotOwnerId: null }
        : {},
    ),

  close: () =>
    set({
      episodeId: null,
      src: null,
      title: undefined,
      nextEpisodeId: null,
      timestampActions: [],
      initialTimeSeconds: 0,
      overlayMessages: [],
    }),
}));
