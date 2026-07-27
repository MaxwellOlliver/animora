"use client";

import { useMediaState } from "@vidstack/react";
import { Maximize2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

import { WatchHistorySync } from "@/features/watch/components/watch-history-sync";
import { WatchPartyPlayerSync } from "@/features/watch-party/watch-party-player-sync";
import { cn } from "@/lib/utils";

import { useMiniplayerStore } from "./miniplayer-store";
import { usePlayerSettings } from "./player-store";
import { VideoPlayer } from "./video-player";

function WatchAutoplay({
  nextEpisodeId,
  onNavigate,
}: {
  nextEpisodeId?: string | null;
  onNavigate: (episodeId: string) => void;
}) {
  const ended = useMediaState("ended");
  const autoPlay = usePlayerSettings((state) => state.autoPlay);
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    if (!autoPlay || !ended || !nextEpisodeId || hasNavigatedRef.current) {
      return;
    }

    hasNavigatedRef.current = true;
    onNavigate(nextEpisodeId);
  }, [autoPlay, ended, nextEpisodeId, onNavigate]);

  useEffect(() => {
    hasNavigatedRef.current = false;
  }, [nextEpisodeId]);

  return null;
}

export function PlayerHost() {
  const router = useRouter();
  const episodeId = useMiniplayerStore((s) => s.episodeId);
  const src = useMiniplayerStore((s) => s.src);
  const title = useMiniplayerStore((s) => s.title);
  const nextEpisodeId = useMiniplayerStore((s) => s.nextEpisodeId);
  const timestampActions = useMiniplayerStore((s) => s.timestampActions);
  const initialTimeSeconds = useMiniplayerStore((s) => s.initialTimeSeconds);
  const overlayMessages = useMiniplayerStore((s) => s.overlayMessages);
  const activeSlotEl = useMiniplayerStore((s) => s.activeSlotEl);
  const close = useMiniplayerStore((s) => s.close);

  const carrierRef = useRef<HTMLDivElement | null>(null);
  const floatingContainerRef = useRef<HTMLDivElement | null>(null);

  // Create the carrier exactly once per episode session, and land it
  // wherever makes sense right now: an already-claimed slot if one beat us
  // to it, otherwise the floating box. After this it's never recreated -
  // only ever physically moved by PlayerSlot's mount/unmount.
  useLayoutEffect(() => {
    if (!episodeId) return;
    const carrier = carrierRef.current;
    if (!carrier) return;

    const store = useMiniplayerStore.getState();
    if (store.carrierEl) return;

    store.setCarrierEl(carrier);
    const target = store.activeSlotEl ?? floatingContainerRef.current;
    target?.appendChild(carrier);
  }, [episodeId]);

  if (!episodeId || !src) return null;

  function navigateToEpisode(targetEpisodeId: string) {
    router.push(`/watch/${targetEpisodeId}`);
  }

  const player = (
    <VideoPlayer
      key={episodeId}
      src={src}
      title={title}
      autoPlay
      initialTimeSeconds={initialTimeSeconds}
      onNextEpisode={
        nextEpisodeId ? () => navigateToEpisode(nextEpisodeId) : undefined
      }
      timestampActions={timestampActions}
      overlayMessages={overlayMessages}
    >
      <WatchHistorySync episodeId={episodeId} />
      <WatchPartyPlayerSync />
      <WatchAutoplay
        nextEpisodeId={nextEpisodeId}
        onNavigate={navigateToEpisode}
      />
    </VideoPlayer>
  );

  return (
    <>
      <div
        className={cn(
          "fixed bottom-4 right-4 z-30 w-80 overflow-hidden rounded-xl bg-black shadow-2xl",
          activeSlotEl && "hidden",
        )}
      >
        <div className="relative">
          <div
            ref={(el) => {
              floatingContainerRef.current = el;
              if (el) useMiniplayerStore.getState().setFloatingContainerEl(el);
            }}
          />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 bg-gradient-to-b from-black/70 to-transparent px-2 py-1.5 opacity-0 transition-opacity hover:opacity-100">
            <button
              type="button"
              onClick={() => navigateToEpisode(episodeId)}
              className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
            >
              <Maximize2 className="size-3.5 shrink-0 text-white/90" />
              <span className="truncate text-xs text-white/90">{title}</span>
            </button>
            <button
              type="button"
              aria-label="Close miniplayer"
              onClick={close}
              className="shrink-0 rounded p-1 text-white/90 hover:bg-white/10"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
      <div ref={carrierRef} className="contents">
        {player}
      </div>
    </>
  );
}
