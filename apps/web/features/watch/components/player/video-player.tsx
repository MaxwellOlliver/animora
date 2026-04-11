"use client";

import {
  isHLSProvider,
  MediaPlayer,
  type MediaPlayerInstance,
  MediaProvider,
  type MediaProviderAdapter,
} from "@vidstack/react";
import { useEffect, useRef } from "react";

import { PlayerControls } from "./controls";
import { PlayerControlsVisibility } from "./controls-visibility";
import { PlayerLoader } from "./loader";
import { type OverlayMessage,PlayerOverlayMessages } from "./overlay-messages";
import { PlayerProvider } from "./player-context";
import { usePlayerSettings } from "./player-store";
import { PlayerProgressBar } from "./progress-bar";
import { SettingsPopover } from "./settings";
import { PlayerSkipButton, type TimestampAction } from "./skip-button";
import { TapPanels } from "./tap-panels";

type VideoPlayerProps = {
  src: string;
  title?: string;
  autoPlay?: boolean;
  initialTimeSeconds?: number;
  children?: React.ReactNode;
  onPrevEpisode?: () => void;
  onNextEpisode?: () => void;
  timestampActions?: TimestampAction[];
  overlayMessages?: OverlayMessage[];
};

export function VideoPlayer({
  src,
  title,
  autoPlay = false,
  initialTimeSeconds = 0,
  children,
  onPrevEpisode,
  onNextEpisode,
  timestampActions = [],
  overlayMessages = [],
}: VideoPlayerProps) {
  const playerRef = useRef<MediaPlayerInstance>(null);
  const hasAppliedInitialTimeRef = useRef(false);
  const volume = usePlayerSettings((s) => s.volume);
  const muted = usePlayerSettings((s) => s.muted);

  function onProviderChange(provider: MediaProviderAdapter | null) {
    if (isHLSProvider(provider)) {
      provider.config = {
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
      };
    }
  }

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    player.qualities.switch = "next";
  }, []);

  useEffect(() => {
    const player = playerRef.current;

    if (
      !player ||
      hasAppliedInitialTimeRef.current ||
      initialTimeSeconds <= 0
    ) {
      return;
    }

    player.currentTime = initialTimeSeconds;
    hasAppliedInitialTimeRef.current = true;
  }, [initialTimeSeconds]);

  return (
    <MediaPlayer
      ref={playerRef}
      src={src}
      volume={volume}
      muted={muted}
      autoPlay={autoPlay}
      crossOrigin
      playsInline
      onProviderChange={onProviderChange}
      className="group relative w-full h-[calc(100dvh-10rem)] aspect-auto! overflow-hidden bg-black **:data-media-provider:h-full! [&_video]:size-full! [&_video]:object-contain!"
    >
      <MediaProvider />
      <PlayerProvider>
        <TapPanels />
        <PlayerLoader />
        {overlayMessages.length > 0 && (
          <PlayerOverlayMessages
            messages={overlayMessages}
            displayDuration={5000}
          />
        )}
        <PlayerSkipButton actions={timestampActions} />
        <PlayerControlsVisibility>
          <PlayerProgressBar />
          <PlayerControls
            title={title}
            onPrevEpisode={onPrevEpisode}
            onNextEpisode={onNextEpisode}
          />
        </PlayerControlsVisibility>
        <SettingsPopover />
        {children}
      </PlayerProvider>
    </MediaPlayer>
  );
}
