"use client";

import { useEffect, useRef } from "react";
import {
  isHLSProvider,
  MediaPlayer,
  MediaProvider,
  type MediaPlayerInstance,
  type MediaProviderAdapter,
} from "@vidstack/react";
import "@vidstack/react/player/styles/base.css";
import { PlayerControls } from "./controls";
import { PlayerProgressBar } from "./progress-bar";
import { PlayerControlsVisibility } from "./controls-visibility";
import { PlayerSkipButton, type TimestampAction } from "./skip-button";
import { PlayerOverlayMessages, type OverlayMessage } from "./overlay-messages";
import { PlayerLoader } from "./loader";
import { SettingsPopover } from "./settings";
import { PlayerProvider } from "./player-context";
import { TapPanels } from "./tap-panels";

type VideoPlayerProps = {
  src: string;
  title?: string;
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
  initialTimeSeconds = 0,
  children,
  onPrevEpisode,
  onNextEpisode,
  timestampActions = [],
  overlayMessages = [],
}: VideoPlayerProps) {
  const playerRef = useRef<MediaPlayerInstance>(null);
  const hasAppliedInitialTimeRef = useRef(false);

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

    if (!player || hasAppliedInitialTimeRef.current || initialTimeSeconds <= 0) {
      return;
    }

    player.currentTime = initialTimeSeconds;
    hasAppliedInitialTimeRef.current = true;
  }, [initialTimeSeconds]);

  return (
    <MediaPlayer
      ref={playerRef}
      src={src}
      crossOrigin
      playsInline
      onProviderChange={onProviderChange}
      className="group relative aspect-video w-full h-[calc(100dvh-10rem)] overflow-hidden bg-black [&_video]:h-full!"
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
