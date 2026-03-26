"use client";

import { useState } from "react";
import { Copy, Check, Smile, SendHorizonal, Circle } from "lucide-react";
import { Avatar } from "@/app/components/ui/avatar";
import { WatchPartyMembers } from "./watch-party-members";

const MOCK_ROOM_CODE = "A1K998SU";
const MOCK_VIEWER_COUNT = 5;

const MOCK_MESSAGES = [
  {
    id: 1,
    user: "Eren_Fan42",
    avatar: "/images/avatar-placeholder.svg",
    text: "This opening scene still gives me chills every time",
    timestamp: "22:31",
  },
  {
    id: 2,
    user: "MikasaSimp",
    avatar: "/images/avatar-placeholder.svg",
    text: "The animation quality is insane for 2013",
    timestamp: "22:31",
  },
  {
    id: 3,
    user: "TitanSlayer",
    avatar: "/images/avatar-placeholder.svg",
    text: "Wait for it... this next part 🔥",
    timestamp: "22:32",
  },
  {
    id: 4,
    user: "ArminAlert",
    avatar: "/images/avatar-placeholder.svg",
    text: "The soundtrack here is peak Sawano",
    timestamp: "22:33",
  },
  {
    id: 5,
    user: "Eren_Fan42",
    avatar: "/images/avatar-placeholder.svg",
    text: "LETS GOOO",
    timestamp: "22:33",
  },
];

export function WatchPartyChat() {
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");

  function handleCopy() {
    navigator.clipboard.writeText(MOCK_ROOM_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSend() {
    if (!message.trim()) return;
    setMessage("");
  }

  return (
    <div className="flex h-120 flex-col overflow-hidden rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="group flex items-center gap-1.5 rounded-md bg-background-muted px-2.5 py-1 text-xs font-medium text-foreground-muted transition-colors hover:text-foreground"
          >
            <span className="font-mono tracking-wide">#{MOCK_ROOM_CODE}</span>
            {copied ? (
              <Check className="size-3 text-success" />
            ) : (
              <Copy className="size-3 opacity-50 transition-opacity group-hover:opacity-100" />
            )}
          </button>
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
            <Circle className="relative size-2 fill-success text-success" />
          </span>
        </div>

        <WatchPartyMembers count={MOCK_VIEWER_COUNT} />
      </div>

      {/* Messages */}
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-3">
        {MOCK_MESSAGES.map((msg, i) => (
          <div
            key={msg.id}
            className="group flex items-start gap-2.5 rounded-md px-1.5 py-1.5 transition-colors hover:bg-foreground/3"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <Avatar
              src={msg.avatar}
              alt={msg.user}
              className="mt-0.5 size-7 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="truncate text-xs font-semibold text-primary">
                  {msg.user}
                </span>
                <span className="shrink-0 text-[10px] text-foreground-muted/50">
                  {msg.timestamp}
                </span>
              </div>
              <p className="text-sm leading-snug text-foreground/90 wrap-break-word">
                {msg.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
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
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-placeholder"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!message.trim()}
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
