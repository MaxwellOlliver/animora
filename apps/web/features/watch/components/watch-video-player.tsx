"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";

import { useMiniplayerStore } from "@/features/watch/components/player/miniplayer-store";
import type { OverlayMessage } from "@/features/watch/components/player/overlay-messages";
import { PlayerSlot } from "@/features/watch/components/player/player-slot";
import type { TimestampAction } from "@/features/watch/components/player/skip-button";
import { buildFetchEpisodeWatchHistoryQueryOptions } from "@/features/watch/queries/fetch-episode-watch-history";
import { useWatchParty } from "@/features/watch-party/watch-party-context";

type WatchVideoPlayerProps = {
  episodeId: string;
  src: string;
  title?: string;
  nextEpisodeId?: string | null;
  timestampActions?: TimestampAction[];
};

export function WatchVideoPlayer({
  episodeId,
  src,
  title,
  nextEpisodeId,
  timestampActions = [],
}: WatchVideoPlayerProps) {
  const wp = useWatchParty();
  const loadedEpisodeIdRef = useRef<string | null>(null);

  const chat = wp?.chat;
  const overlayMessages: OverlayMessage[] = useMemo(
    () =>
      chat
        ?.filter((item) => item.kind === "chat")
        .slice(-10)
        .map((item) => ({
          id: item.id,
          user: item.displayName,
          text: item.content,
        })) ?? [],
    [chat],
  );
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

  useEffect(() => {
    if (!isFetched || isPending) return;
    if (loadedEpisodeIdRef.current === episodeId) return;
    loadedEpisodeIdRef.current = episodeId;
    useMiniplayerStore.getState().load({
      episodeId,
      src,
      title,
      nextEpisodeId,
      timestampActions,
      initialTimeSeconds,
    });
  }, [
    episodeId,
    isFetched,
    isPending,
    src,
    title,
    nextEpisodeId,
    timestampActions,
    initialTimeSeconds,
  ]);

  useEffect(() => {
    useMiniplayerStore.getState().setOverlayMessages(overlayMessages);
  }, [overlayMessages]);

  if (!isFetched || isPending) {
    return (
      <div className="flex aspect-video max-h-[calc(100dvh-10rem)] w-full items-center justify-center bg-black">
        <Loader2 className="size-12 animate-spin text-white/80" />
      </div>
    );
  }

  return <PlayerSlot />;
}
