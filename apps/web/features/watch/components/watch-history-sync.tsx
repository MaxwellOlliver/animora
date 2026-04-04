"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMediaState } from "@vidstack/react";

type WatchHistoryStatus = "watching" | "finished";

type WatchHistorySyncProps = {
  episodeId: string;
};

async function upsertWatchHistory(
  episodeId: string,
  positionSeconds: number,
  status: WatchHistoryStatus,
) {
  const response = await fetch("/api/proxy/watch-history", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      episodeId,
      positionSeconds,
      status,
    }),
    keepalive: true,
  });

  if (!response.ok) {
    throw new Error(`Failed to upsert watch history: ${response.status}`);
  }
}

export function WatchHistorySync({ episodeId }: WatchHistorySyncProps) {
  const currentTime = useMediaState("currentTime");
  const paused = useMediaState("paused");
  const started = useMediaState("started");
  const ended = useMediaState("ended");
  const duration = useMediaState("duration");

  const wasPausedRef = useRef(paused);
  const lastSentSnapshotRef = useRef<string | null>(null);
  const playbackStateRef = useRef({
    currentTime,
    duration,
    started,
    ended,
    episodeId,
  });

  useEffect(() => {
    playbackStateRef.current = {
      currentTime,
      duration,
      started,
      ended,
      episodeId,
    };
  }, [currentTime, duration, started, ended, episodeId]);

  const sendSnapshot = useCallback((status: WatchHistoryStatus) => {
    const playbackState = playbackStateRef.current;

    if (!playbackState.started) return;

    const roundedPosition =
      status === "finished"
        ? Math.max(
            Math.floor(playbackState.duration),
            Math.floor(playbackState.currentTime),
          )
        : Math.floor(playbackState.currentTime);

    if (roundedPosition < 0) return;

    const snapshotKey = `${status}:${roundedPosition}`;
    if (lastSentSnapshotRef.current === snapshotKey) return;

    lastSentSnapshotRef.current = snapshotKey;

    void upsertWatchHistory(
      playbackState.episodeId,
      roundedPosition,
      status,
    ).catch(() => {
      lastSentSnapshotRef.current = null;
    });
  }, []);

  useEffect(() => {
    if (!started || paused || ended) return;

    const intervalId = window.setInterval(() => {
      sendSnapshot("watching");
    }, 15_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [started, paused, ended, sendSnapshot]);

  useEffect(() => {
    if (!started) {
      wasPausedRef.current = paused;
      return;
    }

    const wasPaused = wasPausedRef.current;
    wasPausedRef.current = paused;

    if (paused === wasPaused) return;

    sendSnapshot(ended ? "finished" : "watching");
  }, [started, paused, ended, sendSnapshot]);

  useEffect(() => {
    if (!started || !ended) return;
    sendSnapshot("finished");
  }, [started, ended, sendSnapshot]);

  useEffect(() => {
    const handlePageHide = () => {
      if (!started) return;
      sendSnapshot(ended ? "finished" : "watching");
    };

    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [started, ended, sendSnapshot]);

  return null;
}
