"use client";

import { useQuery } from "@tanstack/react-query";
import { useMediaState } from "@vidstack/react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import type { OverlayMessage } from "@/features/watch/components/player/overlay-messages";
import { usePlayerSettings } from "@/features/watch/components/player/player-store";
import type { TimestampAction } from "@/features/watch/components/player/skip-button";
import { VideoPlayer } from "@/features/watch/components/player/video-player";
import { WatchHistorySync } from "@/features/watch/components/watch-history-sync";
import { buildFetchEpisodeWatchHistoryQueryOptions } from "@/features/watch/queries/fetch-episode-watch-history";

type WatchVideoPlayerProps = {
  episodeId: string;
  src: string;
  title?: string;
  nextEpisodeId?: string | null;
  timestampActions?: TimestampAction[];
  overlayMessages?: OverlayMessage[];
};

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

export function WatchVideoPlayer({
  episodeId,
  src,
  title,
  nextEpisodeId,
  timestampActions = [],
  overlayMessages = [],
}: WatchVideoPlayerProps) {
  const router = useRouter();
  const {
    data: watchHistory,
    isPending,
    isFetched,
  } = useQuery({
    ...buildFetchEpisodeWatchHistoryQueryOptions(episodeId),
    retry: false,
  });

  const initialTimeSeconds =
    watchHistory?.status === "watching" ? watchHistory.positionSeconds : 0;

  function navigateToEpisode(targetEpisodeId: string) {
    router.push(`/watch/${targetEpisodeId}`);
  }

  if (!isFetched || isPending) {
    return (
      <div className="flex h-[calc(100dvh-10rem)] w-full items-center justify-center bg-black">
        <Loader2 className="size-12 animate-spin text-white/80" />
      </div>
    );
  }

  return (
    <VideoPlayer
      key={`${episodeId}:${initialTimeSeconds}`}
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
      <WatchAutoplay
        nextEpisodeId={nextEpisodeId}
        onNavigate={navigateToEpisode}
      />
    </VideoPlayer>
  );
}
