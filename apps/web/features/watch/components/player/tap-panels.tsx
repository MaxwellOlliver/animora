"use client";

import { useCallback, useRef, useState } from "react";
import { useMediaState, useMediaRemote } from "@vidstack/react";
import { Pause, Play, RotateCcw, RotateCw } from "lucide-react";

const SEEK_SECONDS = 10;
const DOUBLE_TAP_MS = 300;

type Indicator = {
  type: "play" | "pause" | "seek-back" | "seek-forward";
  key: number;
};

function IndicatorIcon({ type }: { type: Indicator["type"] }) {
  switch (type) {
    case "play":
      return <Play className="size-6 fill-white" />;
    case "pause":
      return <Pause className="size-6 fill-white" />;
    case "seek-back":
      return (
        <div className="flex flex-col items-center gap-0.5">
          <RotateCcw className="size-6" />
          <span className="text-xs font-medium">{SEEK_SECONDS}s</span>
        </div>
      );
    case "seek-forward":
      return (
        <div className="flex flex-col items-center gap-0.5">
          <RotateCw className="size-6" />
          <span className="text-xs font-medium">{SEEK_SECONDS}s</span>
        </div>
      );
  }
}

export function TapPanels() {
  const paused = useMediaState("paused");
  const currentTime = useMediaState("currentTime");
  const duration = useMediaState("duration");
  const remote = useMediaRemote();

  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapSideRef = useRef<"left" | "right" | null>(null);
  const [indicator, setIndicator] = useState<Indicator | null>(null);

  const showIndicator = useCallback((type: Indicator["type"]) => {
    setIndicator({ type, key: Date.now() });
    setTimeout(() => setIndicator(null), 600);
  }, []);

  const handleTap = useCallback(
    (side: "left" | "right") => {
      if (tapTimerRef.current && tapSideRef.current === side) {
        clearTimeout(tapTimerRef.current);
        tapTimerRef.current = null;
        tapSideRef.current = null;

        if (side === "left") {
          remote.seek(Math.max(0, currentTime - SEEK_SECONDS));
          showIndicator("seek-back");
        } else {
          remote.seek(Math.min(duration, currentTime + SEEK_SECONDS));
          showIndicator("seek-forward");
        }
      } else {
        if (tapTimerRef.current) {
          clearTimeout(tapTimerRef.current);
        }
        tapSideRef.current = side;
        tapTimerRef.current = setTimeout(() => {
          tapTimerRef.current = null;
          tapSideRef.current = null;
          if (paused) {
            remote.play();
            showIndicator("play");
          } else {
            remote.pause();
            showIndicator("pause");
          }
        }, DOUBLE_TAP_MS);
      }
    },
    [paused, currentTime, duration, remote, showIndicator],
  );

  return (
    <div className="absolute inset-0 z-0 flex">
      <button
        type="button"
        aria-label="Tap to play/pause, double tap to rewind"
        className="h-full w-1/2 cursor-default focus:outline-none"
        onClick={() => handleTap("left")}
      />
      <button
        type="button"
        aria-label="Tap to play/pause, double tap to fast forward"
        className="h-full w-1/2 cursor-default focus:outline-none"
        onClick={() => handleTap("right")}
      />

      {indicator && (
        <div
          key={indicator.key}
          className="pointer-events-none absolute inset-0 flex items-center justify-center animate-tap-indicator"
        >
          <div className="flex size-16 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm">
            <IndicatorIcon type={indicator.type} />
          </div>
        </div>
      )}
    </div>
  );
}
