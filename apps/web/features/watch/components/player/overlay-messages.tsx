"use client";

import { useEffect, useState } from "react";
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

type VisibleMessage = OverlayMessage & { visibleAt: number };

export function PlayerOverlayMessages({
  messages,
  displayDuration = 5000,
}: PlayerOverlayMessagesProps) {
  const [visible, setVisible] = useState<VisibleMessage[]>([]);

  useEffect(() => {
    if (messages.length === 0) return;

    const latest = messages[messages.length - 1];
    if (!latest) return;

    setVisible((prev) => {
      const exists = prev.some((m) => m.id === latest.id);
      if (exists) return prev;
      return [...prev, { ...latest, visibleAt: Date.now() }];
    });
  }, [messages]);

  useEffect(() => {
    if (visible.length === 0) return;

    const timer = setInterval(() => {
      const now = Date.now();
      setVisible((prev) =>
        prev.filter((m) => now - m.visibleAt < displayDuration),
      );
    }, 500);

    return () => clearInterval(timer);
  }, [visible.length, displayDuration]);

  if (visible.length === 0) return null;

  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
      {visible.map((msg) => (
        <div
          key={msg.id}
          className="animate-in fade-in slide-in-from-right-4 flex items-start gap-2.5 rounded-lg bg-black/60 px-3 py-2.5 backdrop-blur-md"
        >
          <Avatar
            src={msg.avatar}
            alt={msg.user}
            className="mt-0.5 size-7 shrink-0"
          />
          <div className="min-w-0 max-w-56">
            <span className="block truncate text-xs font-semibold text-primary">
              {msg.user}
            </span>
            <p className="text-sm leading-snug text-white/90 wrap-break-word">
              {msg.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
