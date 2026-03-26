"use client";

import { useMediaState } from "@vidstack/react";
import { Loader2 } from "lucide-react";

export function PlayerLoader() {
  const waiting = useMediaState("waiting");
  const canPlay = useMediaState("canPlay");
  const started = useMediaState("started");

  const showLoader = !canPlay || (started && waiting);

  if (!showLoader) return null;

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <Loader2 className="size-12 animate-spin text-white/80" />
    </div>
  );
}
