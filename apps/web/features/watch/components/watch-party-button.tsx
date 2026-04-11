"use client";

import { Popover } from "@base-ui-components/react/popover";
import { UsersRound, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function WatchPartyButton() {
  const [open, setOpen] = useState(false);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        render={
          <Button variant={open ? "primary" : "ghost"} size="sm">
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
              <Button className="w-full">create session</Button>
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-foreground-muted">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter session code"
                  className="flex-1 rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none placeholder:text-placeholder focus:ring-2 focus:ring-ring"
                />
                <Button variant="outline">join</Button>
              </div>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
