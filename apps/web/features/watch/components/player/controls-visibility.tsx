"use client";

import { type ReactNode } from "react";
import { useMediaState } from "@vidstack/react";

type PlayerControlsVisibilityProps = {
  children: ReactNode;
};

export function PlayerControlsVisibility({ children }: PlayerControlsVisibilityProps) {
  const visible = useMediaState("controlsVisible");

  return (
    <div
      data-visible={visible}
      className="absolute inset-x-0 bottom-0 flex flex-col transition-opacity duration-300 data-[visible=false]:pointer-events-none data-[visible=false]:opacity-0"
    >
      {children}
    </div>
  );
}
