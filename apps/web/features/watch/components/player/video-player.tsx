"use client";

import { useRef } from "react";
import {
  MediaPlayer,
  MediaProvider,
  type MediaPlayerInstance,
} from "@vidstack/react";
import "@vidstack/react/player/styles/base.css";
import { PlayerControls } from "./controls";
import { PlayerProgressBar } from "./progress-bar";
import { PlayerControlsVisibility } from "./controls-visibility";
import { PlayerSkipButton, type TimestampAction } from "./skip-button";
import { PlayerOverlayMessages, type OverlayMessage } from "./overlay-messages";
import { PlayerLoader } from "./loader";
import { SettingsPopover } from "./settings-popover";
import { PlayerProvider } from "./player-context";

type VideoPlayerProps = {
  src: string;
  title?: string;
  onPrevEpisode?: () => void;
  onNextEpisode?: () => void;
  timestampActions?: TimestampAction[];
  overlayMessages?: OverlayMessage[];
};

export function VideoPlayer({
  src,
  title,
  onPrevEpisode,
  onNextEpisode,
  timestampActions = [],
  overlayMessages = [],
}: VideoPlayerProps) {
  const playerRef = useRef<MediaPlayerInstance>(null);

  return (
    <MediaPlayer
      ref={playerRef}
      src={src}
      crossOrigin
      playsInline
      className="group relative aspect-video w-full h-[calc(100dvh-6rem)] overflow-hidden bg-black [&_video]:h-full!"
    >
      <MediaProvider />
      <PlayerProvider>
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
      </PlayerProvider>
    </MediaPlayer>
  );
}
