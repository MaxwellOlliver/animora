"use client";

import { useCallback, useRef, useState } from "react";
import { useMediaState, useMediaRemote, useMediaPlayer } from "@vidstack/react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  PictureInPicture2,
  Settings,
  Subtitles,
} from "lucide-react";
import { cn } from "@/lib/utils";

type PlayerControlsProps = {
  title?: string;
  onPrevEpisode?: () => void;
  onNextEpisode?: () => void;
};

function formatTime(seconds: number) {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function ControlButton({
  onClick,
  label,
  children,
  className = "",
}: {
  onClick?: () => void;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex items-center hover:bg-foreground/10 justify-center rounded-md p-1.5 text-white/90 transition-colors hover:text-white ${className}`}
    >
      {children}
    </button>
  );
}

function VolumeControl() {
  const volume = useMediaState("volume");
  const muted = useMediaState("muted");
  const remote = useMediaRemote();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [dragging, setDragging] = useState(false);

  const effectiveVolume = muted ? 0 : volume;

  const VolumeIcon =
    muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  const setVolume = useCallback(
    (clientX: number) => {
      const el = sliderRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      remote.changeVolume(pct);
      if (muted && pct > 0) remote.unmute();
    },
    [remote, muted],
  );

  return (
    <div
      className="flex items-center gap-1"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => {
        setHovering(false);
        setDragging(false);
      }}
    >
      <ControlButton label={muted ? "Unmute" : "Mute"}>
        <VolumeIcon
          className="size-5"
          onClick={() => (muted ? remote.unmute() : remote.mute())}
        />

        <div
          className={cn(
            "overflow-hidden transition-[width,opacity] duration-200",
          )}
          style={{
            width: hovering || dragging ? 80 : 0,
            opacity: hovering || dragging ? 1 : 0,
          }}
        >
          <div
            ref={sliderRef}
            role="slider"
            aria-label="Volume"
            aria-valuemin={0}
            aria-valuemax={1}
            aria-valuenow={effectiveVolume}
            tabIndex={0}
            className="flex h-5 cursor-pointer items-center px-2"
            onPointerDown={(e) => {
              e.preventDefault();
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
              setDragging(true);
              setVolume(e.clientX);
            }}
            onPointerMove={(e) => {
              if (dragging) setVolume(e.clientX);
            }}
            onPointerUp={() => setDragging(false)}
          >
            <div className="relative h-1 w-full rounded-full bg-white/20">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-white"
                style={{ width: `${effectiveVolume * 100}%` }}
              />
              <div
                className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-md"
                style={{ left: `${effectiveVolume * 100}%` }}
              />
            </div>
          </div>
        </div>
      </ControlButton>
    </div>
  );
}

export function PlayerControls({
  title,
  onPrevEpisode,
  onNextEpisode,
}: PlayerControlsProps) {
  const paused = useMediaState("paused");
  const currentTime = useMediaState("currentTime");
  const duration = useMediaState("duration");
  const fullscreen = useMediaState("fullscreen");
  const pip = useMediaState("pictureInPicture");
  const remote = useMediaRemote();
  const player = useMediaPlayer();

  const togglePlay = useCallback(() => {
    paused ? remote.play() : remote.pause();
  }, [paused, remote]);

  const toggleFullscreen = useCallback(() => {
    fullscreen ? remote.exitFullscreen() : remote.enterFullscreen();
  }, [fullscreen, remote]);

  const togglePip = useCallback(() => {
    pip ? remote.exitPictureInPicture() : remote.enterPictureInPicture();
  }, [pip, remote]);

  return (
    <div className="flex items-center gap-1 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
      {/* Left controls */}
      <div className="flex items-center gap-0.5 bg-background/40 p-1.5 rounded-lg">
        <ControlButton label={paused ? "Play" : "Pause"} onClick={togglePlay}>
          {paused ? (
            <Play className="size-5 fill-white" />
          ) : (
            <Pause className="size-5 fill-white" />
          )}
        </ControlButton>
        {onPrevEpisode && (
          <ControlButton label="Previous episode" onClick={onPrevEpisode}>
            <SkipBack className="size-5 fill-white" />
          </ControlButton>
        )}
        {onNextEpisode && (
          <ControlButton label="Next episode" onClick={onNextEpisode}>
            <SkipForward className="size-5 fill-white" />
          </ControlButton>
        )}
        <VolumeControl />
        <span className="text-xs text-white/80 tabular-nums select-none p-1.5">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right controls */}
      <div className="flex items-center gap-0.5 bg-background/40 p-1.5 rounded-lg">
        <ControlButton label="Subtitles" onClick={() => {}}>
          <Subtitles className="size-5" />
        </ControlButton>

        <ControlButton label="Settings" onClick={() => {}}>
          <Settings className="size-5" />
        </ControlButton>

        <ControlButton label="Picture in picture" onClick={togglePip}>
          <PictureInPicture2 className="size-5" />
        </ControlButton>

        <ControlButton
          label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          onClick={toggleFullscreen}
        >
          {fullscreen ? (
            <Minimize className="size-5" />
          ) : (
            <Maximize className="size-5" />
          )}
        </ControlButton>
      </div>
    </div>
  );
}
