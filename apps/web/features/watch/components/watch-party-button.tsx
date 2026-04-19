"use client";

import { Popover } from "@base-ui-components/react/popover";
import { Loader2, LogOut, UsersRound, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { createWatchParty, joinWatchParty } from "@/features/watch-party/api";
import {
  WP_JOIN_EVENT,
  WP_LEAVE_EVENT,
} from "@/features/watch-party/watch-party-shell";

type WatchPartyButtonProps = {
  episodeId: string;
};

export function WatchPartyButton({ episodeId }: WatchPartyButtonProps) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<"create" | "join" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeCode, setActiveCode] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      const url = new URL(window.location.href);
      setActiveCode(url.searchParams.get("wp"));
    };
    sync();
    window.addEventListener(WP_JOIN_EVENT, sync);
    window.addEventListener(WP_LEAVE_EVENT, sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener(WP_JOIN_EVENT, sync);
      window.removeEventListener(WP_LEAVE_EVENT, sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  function navigateWithCode(nextCode: string) {
    const upper = nextCode.toUpperCase();
    window.dispatchEvent(
      new CustomEvent(WP_JOIN_EVENT, { detail: { code: upper } }),
    );
    setActiveCode(upper);
    setOpen(false);
  }

  async function handleCreate() {
    setBusy("create");
    setError(null);
    try {
      const { session } = await createWatchParty(episodeId);
      navigateWithCode(session.code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setBusy(null);
    }
  }

  async function handleJoin() {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setBusy("join");
    setError(null);
    try {
      await joinWatchParty(trimmed);
      navigateWithCode(trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join");
    } finally {
      setBusy(null);
    }
  }

  function handleLeave() {
    window.dispatchEvent(new CustomEvent(WP_LEAVE_EVENT));
    setActiveCode(null);
    setOpen(false);
  }

  if (activeCode) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLeave}
        className="text-danger hover:bg-danger/10"
      >
        <LogOut className="size-4" />
        leave party #{activeCode}
      </Button>
    );
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        render={
          <Button variant="ghost" size="sm">
            <UsersRound className="size-4" />
            watch party
          </Button>
        }
      />
      <Popover.Portal>
        <Popover.Positioner
          className="z-50"
          sideOffset={8}
          side="bottom"
          align="start"
        >
          <Popover.Popup className="w-80 origin-(--transform-origin) rounded-lg border border-border bg-card p-4 shadow-lg transition-[transform,scale,opacity] data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h4 className="font-heading text-base font-semibold">
                  Watch Party
                </h4>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-foreground-muted transition-colors hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              <p className="text-sm text-foreground-muted">
                Watch together with friends in real time.
              </p>
              <Button
                className="w-full"
                onClick={handleCreate}
                disabled={busy !== null}
              >
                {busy === "create" && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                create session
              </Button>
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-foreground-muted">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter session code"
                  className="flex-1 rounded-md border border-border bg-input px-3 py-2 text-sm font-mono uppercase text-foreground outline-none placeholder:text-placeholder focus:ring-2 focus:ring-ring"
                />
                <Button
                  variant="outline"
                  onClick={handleJoin}
                  disabled={busy !== null || !code.trim()}
                >
                  {busy === "join" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "join"
                  )}
                </Button>
              </div>

              {error && <p className="text-xs text-danger">{error}</p>}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
