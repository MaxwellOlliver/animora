"use client";

import { useState } from "react";
import { Users, Crown, LogOut } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Member = {
  id: string;
  name: string;
  avatar: string;
  isOwner: boolean;
};

const MOCK_MEMBERS: Member[] = [
  {
    id: "1",
    name: "Eren_Fan42",
    avatar: "/images/avatar-placeholder.svg",
    isOwner: true,
  },
  {
    id: "2",
    name: "MikasaSimp",
    avatar: "/images/avatar-placeholder.svg",
    isOwner: false,
  },
  {
    id: "3",
    name: "TitanSlayer",
    avatar: "/images/avatar-placeholder.svg",
    isOwner: false,
  },
  {
    id: "4",
    name: "ArminAlert",
    avatar: "/images/avatar-placeholder.svg",
    isOwner: false,
  },
  {
    id: "5",
    name: "LeviAckerman",
    avatar: "/images/avatar-placeholder.svg",
    isOwner: false,
  },
];

// TODO: replace with real auth context
const CURRENT_USER_IS_OWNER = true;

export function WatchPartyMembers({ count }: { count: number }) {
  const [members, setMembers] = useState(MOCK_MEMBERS);

  function handleKick(memberId: string) {
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
  }

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
          {members.map((member) => (
            <div
              key={member.id}
              className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-foreground/[0.04]"
            >
              <Avatar
                src={member.avatar}
                alt={member.name}
                className="size-9"
              />
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span className="truncate text-sm font-medium">
                  {member.name}
                </span>
                {member.isOwner && (
                  <Crown className="size-3.5 shrink-0 text-warning" />
                )}
              </div>

              {CURRENT_USER_IS_OWNER && !member.isOwner && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleKick(member.id)}
                  className="text-foreground-muted opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
                >
                  <LogOut className="size-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
