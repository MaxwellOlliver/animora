"use client";

import { useMediaState } from "@vidstack/react";
import { Maximize2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { WatchHistorySync } from "@/features/watch/components/watch-history-sync";
import { WatchPartyPlayerSync } from "@/features/watch-party/watch-party-player-sync";

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

function FloatingMiniplayer({
  title,
  onExpand,
  onClose,
  containerRef,
}: {
  title: string | undefined;
  onExpand: () => void;
  onClose: () => void;
  containerRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-30 w-80 overflow-hidden rounded-xl bg-black shadow-2xl">
      <div className="relative">
        <div ref={containerRef} />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 bg-gradient-to-b from-black/70 to-transparent px-2 py-1.5 opacity-0 transition-opacity hover:opacity-100">
          <button
            type="button"
            onClick={onExpand}
            className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
          >
            <Maximize2 className="size-3.5 shrink-0 text-white/90" />
            <span className="truncate text-xs text-white/90">{title}</span>
          </button>
          <button
            type="button"
            aria-label="Close miniplayer"
            onClick={onClose}
            className="shrink-0 rounded p-1 text-white/90 hover:bg-white/10"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
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
  const slotEl = useMiniplayerStore((s) => s.slotEl);
  const close = useMiniplayerStore((s) => s.close);

  const [floatingEl, setFloatingEl] = useState<HTMLDivElement | null>(null);

  if (!episodeId || !src) return null;

  function navigateToEpisode(targetEpisodeId: string) {
    router.push(`/watch/${targetEpisodeId}`);
  }

  const target = slotEl ?? floatingEl;

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
      {!slotEl && (
        <FloatingMiniplayer
          title={title}
          onExpand={() => navigateToEpisode(episodeId)}
          onClose={close}
          containerRef={setFloatingEl}
        />
      )}
      {target ? createPortal(player, target) : null}
    </>
  );
}
