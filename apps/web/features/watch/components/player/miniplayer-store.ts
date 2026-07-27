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

  // The single persistent DOM node PlayerHost renders the player into. It
  // never gets destroyed/recreated for the life of an episode session -
  // only ever physically relocated between the watch page's slot and the
  // floating container via direct DOM moves (see PlayerSlot/PlayerHost).
  carrierEl: HTMLDivElement | null;
  // The floating container's own DOM node - where the carrier rests when
  // no watch page slot currently claims it.
  floatingContainerEl: HTMLDivElement | null;
  // The watch page slot's DOM node, when one is currently mounted/claiming
  // full-mode placement.
  activeSlotEl: HTMLDivElement | null;
  slotOwnerId: string | null;

  load: (params: LoadParams) => void;
  setOverlayMessages: (messages: OverlayMessage[]) => void;
  setCarrierEl: (el: HTMLDivElement) => void;
  setFloatingContainerEl: (el: HTMLDivElement) => void;
  claimSlot: (el: HTMLDivElement, ownerId: string) => void;
  releaseSlot: (ownerId: string) => void;
  close: () => void;
};

export const useMiniplayerStore = create<MiniplayerState>()((set, get) => ({
  episodeId: null,
  src: null,
  title: undefined,
  nextEpisodeId: null,
  timestampActions: [],
  initialTimeSeconds: 0,
  overlayMessages: [],

  carrierEl: null,
  floatingContainerEl: null,
  activeSlotEl: null,
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

  setCarrierEl: (el) => {
    if (get().carrierEl) return;
    set({ carrierEl: el });
  },

  setFloatingContainerEl: (el) => {
    if (get().floatingContainerEl) return;
    set({ floatingContainerEl: el });
  },

  claimSlot: (el, ownerId) => set({ activeSlotEl: el, slotOwnerId: ownerId }),

  releaseSlot: (ownerId) =>
    set((state) =>
      state.slotOwnerId === ownerId
        ? { activeSlotEl: null, slotOwnerId: null }
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
      carrierEl: null,
      floatingContainerEl: null,
      activeSlotEl: null,
      slotOwnerId: null,
    }),
}));
