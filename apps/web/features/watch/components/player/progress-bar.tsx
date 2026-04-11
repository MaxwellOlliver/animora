"use client";

import {
  HLSProvider,
  useMediaPlayer,
  useMediaRemote,
  useMediaState,
} from "@vidstack/react";
import { useCallback, useRef, useState } from "react";

export function PlayerProgressBar() {
  const currentTime = useMediaState("currentTime");
  const duration = useMediaState("duration");
  const buffered = useMediaState("bufferedEnd");
  const ended = useMediaState("ended");
  const remote = useMediaRemote();
  const player = useMediaPlayer();

  const trackRef = useRef<HTMLDivElement>(null);

  const [dragging, setDragging] = useState(false);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedProgress = duration > 0 ? (buffered / duration) * 100 : 0;

  const getPercent = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    return Math.max(
      0,
      Math.min(100, ((clientX - rect.left) / rect.width) * 100),
    );
  }, []);

  const seekTo = useCallback(
    (percent: number) => {
      if (duration > 0) {
        const targetTime = (percent / 100) * duration;
        if (ended && player?.provider) {
          const media = (player.provider as HLSProvider).media;

          media.currentTime = targetTime;
          void media.play().then(() => {
            media.currentTime = targetTime;
          });
        } else {
          remote.seek(targetTime);
        }
      }
    },
    [duration, remote, ended, player],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setDragging(true);
      const pct = getPercent(e.clientX);
      seekTo(pct);
    },
    [getPercent, seekTo],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const pct = getPercent(e.clientX);
      if (dragging) seekTo(pct);
    },
    [dragging, getPercent, seekTo],
  );

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  return (
    <div
      role="slider"
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={duration}
      aria-valuenow={currentTime}
      tabIndex={0}
      className="group/bar relative flex h-5 cursor-pointer items-end px-3"
      onPointerLeave={() => {
        setDragging(false);
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div
        ref={trackRef}
        className="relative h-1 w-full rounded-full bg-white/20 transition-[height] duration-150 group-hover/bar:h-1.5"
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-foreground/50"
          style={{ width: `${bufferedProgress}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary"
          style={{ width: `${progress}%` }}
        />
        <div
          className="pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary opacity-0 shadow-md transition-opacity duration-150 group-hover/bar:opacity-100"
          style={{ left: `${progress}%` }}
        />
      </div>
    </div>
  );
}
