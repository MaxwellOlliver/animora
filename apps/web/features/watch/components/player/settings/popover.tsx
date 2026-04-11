"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

import { cn } from "@/lib/utils";

import { usePlayerContext } from "../player-context";
import { SettingsHomeRoute } from "./home-route";
import { SettingsQualitiesRoute } from "./qualities-route";
import { SettingsRoute } from "./route";
import { SettingsRouter } from "./router";
import { SettingsRouterReset } from "./router-reset";

export function SettingsPopover() {
  const { settingsOpen, closeSettings } = usePlayerContext();
  const innerRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);

  const updateSize = useCallback(() => {
    if (innerRef.current && outerRef.current) {
      const { height, width } = innerRef.current.getBoundingClientRect();
      outerRef.current.style.height = `${height}px`;
      outerRef.current.style.width = `${width}px`;
    }
  }, []);

  useEffect(() => {
    if (settingsOpen) {
      updateSize();
      const first = outerRef.current?.querySelector<HTMLElement>(
        "button, [tabindex]:not([tabindex='-1'])",
      );
      first?.focus();
    } else {
      const trigger = document.querySelector<HTMLElement>(
        "[data-settings-trigger] button",
      );
      trigger?.focus();
    }
  }, [settingsOpen, updateSize]);

  useEffect(() => {
    if (!settingsOpen) return;

    function handlePointerDown(e: PointerEvent) {
      const target = e.target as HTMLElement;
      if (target.closest("[data-settings-trigger]")) return;
      if (outerRef.current && !outerRef.current.contains(target)) {
        closeSettings();
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeSettings();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [settingsOpen, closeSettings]);

  useLayoutEffect(() => {
    if (!innerRef.current || !outerRef.current) return;

    const observer = new ResizeObserver(() => {
      const rect = innerRef.current!.getBoundingClientRect();
      outerRef.current!.style.height = `${rect.height}px`;
      outerRef.current!.style.width = `${rect.width}px`;
    });

    observer.observe(innerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={outerRef}
      className={cn(
        "absolute fill-mode-forwards transition-all slide-in-from-bottom-5 slide-out-to-bottom-5 fade-out fade-in bottom-20 right-4 z-20 origin-bottom-right overflow-hidden rounded-lg bg-background/90 ",
        settingsOpen ? "animate-in" : "pointer-events-none animate-out",
      )}
    >
      <div className="w-fit p-1" ref={innerRef}>
        <SettingsRouter initialRoute="home">
          <SettingsRouterReset />
          <SettingsRoute path="home">
            <SettingsHomeRoute />
          </SettingsRoute>
          <SettingsRoute path="qualities">
            <SettingsQualitiesRoute />
          </SettingsRoute>
        </SettingsRouter>
      </div>
    </div>
  );
}
