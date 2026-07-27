"use client";

import { useId, useLayoutEffect, useRef } from "react";

import { useMiniplayerStore } from "./miniplayer-store";

export function PlayerSlot() {
  const ref = useRef<HTMLDivElement>(null);
  const ownerId = useId();

  useLayoutEffect(() => {
    const slot = ref.current;
    if (!slot) return;

    const store = useMiniplayerStore.getState();
    store.claimSlot(slot, ownerId);
    if (store.carrierEl) {
      slot.appendChild(store.carrierEl);
    }

    return () => {
      const { carrierEl, floatingContainerEl, releaseSlot } =
        useMiniplayerStore.getState();
      if (carrierEl && floatingContainerEl) {
        floatingContainerEl.appendChild(carrierEl);
      }
      releaseSlot(ownerId);
    };
  }, [ownerId]);

  return (
    <div
      ref={ref}
      className="w-full aspect-video! max-h-[calc(100dvh-10rem)] overflow-hidden bg-black"
    />
  );
}
