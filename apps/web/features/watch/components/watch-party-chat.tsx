"use client";

import { MediaPurpose } from "@animora/contracts";
import { Check, Circle, Copy, SendHorizonal, Smile } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Avatar } from "@/components/ui/avatar";
import { useWatchParty } from "@/features/watch-party/watch-party-context";
import { buildMediaUrl } from "@/utils/media-utils";

import { WatchPartyMembers } from "./watch-party-members";

function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function WatchPartyChat() {
  const wp = useWatchParty();
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [wp?.chat.length]);

  if (!wp) {
    return null;
  }

  const code = wp.code;
  const connecting = wp.status === "connecting";
  const avatarByProfileId = new Map(
    wp.members.map((m) => [m.profileId, m.avatar]),
  );

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSend() {
    if (!message.trim() || !wp) return;
    wp.sendChat(message);
    setMessage("");
  }

  return (
    <div className="flex h-120 flex-col overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <h4>Watch Party</h4>
          <button
            type="button"
            onClick={handleCopy}
            className="group flex items-center gap-1.5 rounded-md bg-background-muted px-2.5 py-1 text-xs font-medium text-foreground-muted transition-colors hover:text-foreground"
          >
            <span className="font-mono tracking-wide">#{code}</span>
            {copied ? (
              <Check className="size-3 text-success" />
            ) : (
              <Copy className="size-3 opacity-50 transition-opacity group-hover:opacity-100" />
            )}
          </button>
          <span className="relative flex size-2">
            {wp.status === "connected" && (
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
            )}
            <Circle
              className={`relative size-2 ${
                wp.status === "connected"
                  ? "fill-success text-success"
                  : wp.status === "error"
                    ? "fill-danger text-danger"
                    : "fill-foreground-muted text-foreground-muted"
              }`}
            />
          </span>
        </div>
        <WatchPartyMembers />
      </div>

      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-3"
      >
        {connecting && wp.chat.length === 0 && (
          <div className="m-auto text-xs text-foreground-muted">
            Connecting...
          </div>
        )}
        {wp.chat.map((item) => {
          if (item.kind === "system") {
            return (
              <div
                key={item.id}
                className="flex items-center justify-center gap-2 px-2 py-1 text-xs text-foreground-muted/70"
              >
                <span className="italic">{item.content}</span>
                <span className="text-foreground-muted">
                  · {formatTime(item.at)}
                </span>
              </div>
            );
          }
          return (
            <div
              key={item.id}
              className="group flex items-start gap-2.5 rounded-md px-1.5 py-1.5 transition-colors hover:bg-foreground/3"
            >
              <Avatar
                src={(() => {
                  const avatar = avatarByProfileId.get(item.profileId);
                  return avatar
                    ? buildMediaUrl(avatar.purpose as MediaPurpose, avatar.key)
                    : undefined;
                })()}
                alt={item.displayName}
                className="mt-0.5 size-7 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="truncate text-xs font-semibold text-primary">
                    {item.displayName}
                  </span>
                  <span className="shrink-0 text-[10px] text-foreground-muted/50">
                    {formatTime(item.at)}
                  </span>
                </div>
                <p className="text-sm leading-snug text-foreground/90 wrap-break-word">
                  {item.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-border px-3 py-3">
        <div className="flex items-center gap-2 rounded-lg bg-input px-3 py-2 transition-shadow focus-within:ring-1 focus-within:ring-primary/40">
          <button
            type="button"
            className="shrink-0 text-foreground-muted transition-colors hover:text-foreground"
          >
            <Smile className="size-4" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Your message"
            maxLength={500}
            disabled={wp.status !== "connected"}
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-placeholder disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!message.trim() || wp.status !== "connected"}
            className="flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100"
          >
            <SendHorizonal className="size-3" />
            send
          </button>
        </div>
      </div>
    </div>
  );
}
