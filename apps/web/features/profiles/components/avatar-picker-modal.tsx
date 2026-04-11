"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Check, Loader2, SquareUserRound, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  avatarsQueryOptions,
  getAvatarImageUrl,
  type ProfileAvatar,
} from "@/features/profiles/queries/fetch-avatars";

type AvatarPickerModalProps = {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  value?: string;
  onChange: (avatar: ProfileAvatar) => void;
};

export function AvatarPickerModal({
  open,
  onOpenChangeAction,
  value,
  onChange,
}: AvatarPickerModalProps) {
  const { data: avatars = [], isLoading, isError } = useQuery({
    ...avatarsQueryOptions,
    enabled: open,
  });
  const [picked, setPicked] = useState<string | undefined>(value);
  const selectedId =
    picked ??
    value ??
    avatars.find((avatar) => avatar.default)?.id ??
    avatars[0]?.id;

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setPicked(undefined);
    }

    onOpenChangeAction(nextOpen);
  }

  function handleConfirm() {
    const selectedAvatar = avatars.find((avatar) => avatar.id === selectedId);
    if (!selectedAvatar) return;

    onChange(selectedAvatar);
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <SquareUserRound className="size-6 text-foreground-muted" />
            <DialogTitle>pick your avatar</DialogTitle>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex min-h-42 items-center justify-center rounded-lg border border-border/70 bg-card/40">
            <Loader2 className="size-6 animate-spin text-foreground-muted" />
          </div>
        ) : isError ? (
          <div className="flex min-h-42 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 text-center text-sm text-foreground-muted">
            <AlertCircle className="size-5" />
            <p>Could not load avatars right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {avatars.map((avatar) => (
              <button
                key={avatar.id}
                type="button"
                onClick={() => setPicked(avatar.id)}
                className="group relative size-25 overflow-hidden rounded-lg outline-none ring-secondary ring-offset-2 ring-offset-background focus-visible:ring-2"
              >
                <Image
                  src={getAvatarImageUrl(avatar)}
                  alt={avatar.name}
                  width={100}
                  height={100}
                  className="size-full object-cover"
                />
                {selectedId === avatar.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-secondary/40">
                    <Check className="size-6 text-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            <X />
            cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || isError || !selectedId}
          >
            <Check />
            confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
