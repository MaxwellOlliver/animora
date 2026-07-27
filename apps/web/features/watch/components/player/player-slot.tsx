"use client";

import { useEffect, useId, useRef } from "react";

import { useMiniplayerStore } from "./miniplayer-store";

export function PlayerSlot() {
  const ref = useRef<HTMLDivElement>(null);
  const ownerId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    useMiniplayerStore.getState().registerSlot(el, ownerId);
    return () => {
      useMiniplayerStore.getState().unregisterSlot(ownerId);
    };
  }, [ownerId]);

  return (
    <div
      ref={ref}
      className="w-full aspect-video! max-h-[calc(100dvh-10rem)] overflow-hidden bg-black"
    />
  );
}
