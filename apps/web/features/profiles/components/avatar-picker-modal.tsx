"use client";

import { useState } from "react";
import Image from "next/image";
import { SquareUserRound, Check, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/app/components/ui/dialog";

const avatars = [
  "/images/avatar-placeholder.svg",
  "/images/avatar-placeholder.svg",
  "/images/avatar-placeholder.svg",
  "/images/avatar-placeholder.svg",
  "/images/avatar-placeholder.svg",
  "/images/avatar-placeholder.svg",
];

type AvatarPickerModalProps = {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  selectedAvatar?: string;
  onSelectAction: (avatar: string) => void;
};

export function AvatarPickerModal({
  open,
  onOpenChangeAction,
  selectedAvatar,
  onSelectAction,
}: AvatarPickerModalProps) {
  const [picked, setPicked] = useState(selectedAvatar ?? avatars[0]);

  function handleConfirm() {
    onSelectAction(picked);
    onOpenChangeAction(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <SquareUserRound className="size-6 text-foreground-muted" />
            <DialogTitle>pick your avatar</DialogTitle>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-2.5">
          {avatars.map((avatar, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPicked(avatar)}
              className="group relative size-25 overflow-hidden rounded-lg outline-none focus-visible:ring-2 ring-secondary ring-offset-2 ring-offset-background "
            >
              <Image
                src={avatar}
                alt={`Avatar ${i + 1}`}
                width={100}
                height={100}
                className="size-full object-cover"
              />
              {picked === avatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-secondary/40">
                  <Check className="size-6 text-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChangeAction(false)}>
            <X />
            cancel
          </Button>
          <Button onClick={handleConfirm}>
            <Check />
            confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
