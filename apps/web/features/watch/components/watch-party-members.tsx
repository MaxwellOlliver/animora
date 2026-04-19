"use client";

import { Crown, LogOut, Users } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useWatchParty } from "@/features/watch-party/watch-party-context";

export function WatchPartyMembers() {
  const wp = useWatchParty();
  const count = wp?.members.length ?? 0;
  const ownerProfileId = wp?.session?.ownerProfileId ?? null;
  const isOwner = wp?.isOwner ?? false;

  return (
    <Dialog>
      <DialogTrigger
        render={
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-foreground-muted transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
          >
            <Users className="size-3.5" />
            <span className="text-xs font-medium">{count}</span>
          </button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading">Session members</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-1">
          {wp?.members.map((member) => {
            const memberIsOwner = member.profileId === ownerProfileId;
            return (
              <div
                key={member.profileId}
                className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-foreground/[0.04]"
              >
                <Avatar
                  src={member.avatarUrl ?? "/images/avatar-placeholder.svg"}
                  alt={member.displayName}
                  className="size-9"
                />
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="truncate text-sm font-medium">
                    {member.displayName}
                  </span>
                  {memberIsOwner && (
                    <Crown className="size-3.5 shrink-0 text-warning" />
                  )}
                </div>

                {isOwner && !memberIsOwner && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => wp?.kick(member.profileId)}
                    className="text-foreground-muted opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
                  >
                    <LogOut className="size-3.5" />
                  </Button>
                )}
              </div>
            );
          })}
          {count === 0 && (
            <p className="p-2 text-center text-sm text-foreground-muted">
              No members yet.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
