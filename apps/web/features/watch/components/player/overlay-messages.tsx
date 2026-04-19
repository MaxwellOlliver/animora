"use client";

import { useMediaState } from "@vidstack/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { Avatar } from "@/components/ui/avatar";

export type OverlayMessage = {
  id: string | number;
  user: string;
  avatar?: string;
  text: string;
};

type PlayerOverlayMessagesProps = {
  messages: OverlayMessage[];
  displayDuration?: number;
};

type VisibleMessage = OverlayMessage & {
  visibleAt: number;
  leaving: boolean;
};

const EXIT_DURATION = 300;

export function PlayerOverlayMessages({
  messages,
  displayDuration = 5000,
}: PlayerOverlayMessagesProps) {
  const fullscreen = useMediaState("fullscreen");
  const [visible, setVisible] = useState<VisibleMessage[]>([]);
  const seenIdsRef = useRef<Set<string | number>>(new Set());

  useEffect(() => {
    if (messages.length === 0) return;

    const latest = messages[messages.length - 1];
    if (!latest) return;
    if (seenIdsRef.current.has(latest.id)) return;
    seenIdsRef.current.add(latest.id);

    setVisible((prev) => [
      { ...latest, visibleAt: Date.now(), leaving: false },
      ...prev,
    ]);
  }, [messages]);

  useEffect(() => {
    if (visible.length === 0) return;

    const timer = setInterval(() => {
      const now = Date.now();
      setVisible((prev) => {
        let changed = false;
        const next = prev.flatMap<VisibleMessage>((m) => {
          const age = now - m.visibleAt;
          if (m.leaving) {
            if (age > displayDuration + EXIT_DURATION) {
              changed = true;
              return [];
            }
            return [m];
          }
          if (age >= displayDuration) {
            changed = true;
            return [{ ...m, leaving: true }];
          }
          return [m];
        });
        return changed ? next : prev;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [visible.length, displayDuration]);

  if (!fullscreen || visible.length === 0) return null;

  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
      {visible.map((msg) => (
        <OverlayMessageItem key={msg.id} msg={msg} />
      ))}
    </div>
  );
}

function OverlayMessageItem({ msg }: { msg: VisibleMessage }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!msg.leaving || !ref.current) return;
    const el = ref.current;
    const height = el.offsetHeight;
    el.style.transition =
      "margin-bottom 300ms ease, opacity 300ms ease, transform 300ms ease";
    el.style.marginBottom = `${-(height + 8)}px`;
    el.style.opacity = "0";
    el.style.transform = "translateX(32px)";
  }, [msg.leaving]);

  return (
    <div
      ref={ref}
      className={`flex w-fit max-w-[320px] items-start gap-2.5 rounded-lg bg-black/60 px-3 py-2.5 backdrop-blur-md ${
        msg.leaving
          ? ""
          : "animate-in fade-in slide-in-from-right-4 duration-300"
      }`}
    >
      <Avatar
        src={msg.avatar}
        alt={msg.user}
        className="mt-0.5 size-7 shrink-0"
      />
      <div className="min-w-0">
        <span className="block truncate text-xs font-semibold text-primary">
          {msg.user}
        </span>
        <p className="text-sm leading-snug text-white/90 wrap-break-word">
          {msg.text}
        </p>
      </div>
    </div>
  );
}
