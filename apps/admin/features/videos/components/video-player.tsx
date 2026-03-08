"use client";

import { useEffect, useRef } from "react";
import {
  MediaPlayer,
  type MediaPlayerInstance,
  MediaProvider,
  type MediaProviderAdapter,
  isHLSProvider,
} from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";

interface VideoPlayerProps {
  src: string;
  title?: string;
}

function onProviderChange(provider: MediaProviderAdapter | null) {
  if (isHLSProvider(provider)) {
    provider.config = {
      maxBufferLength: 30,
      maxMaxBufferLength: 60,
    };
  }
}

export function VideoPlayer({ src, title }: VideoPlayerProps) {
  const playerRef = useRef<MediaPlayerInstance>(null);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    player.qualities.switch = "next";
  }, []);

  return (
    <MediaPlayer
      ref={playerRef}
      title={title || "No title"}
      src={src}
      onProviderChange={onProviderChange}
    >
      <MediaProvider />
      <DefaultVideoLayout icons={defaultLayoutIcons} />
    </MediaPlayer>
  );
}
