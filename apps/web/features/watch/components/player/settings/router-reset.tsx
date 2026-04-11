"use client";

import { useEffect, useRef } from "react";

import { usePlayerContext } from "../player-context";
import { useSettingsRouter } from "./router";

export function SettingsRouterReset() {
  const { settingsOpen } = usePlayerContext();
  const { reset } = useSettingsRouter();
  const prevOpen = useRef(settingsOpen);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (prevOpen.current && !settingsOpen) {
      timeout = setTimeout(reset, 200);
    }
    prevOpen.current = settingsOpen;

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [settingsOpen, reset]);

  return null;
}
