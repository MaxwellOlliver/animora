"use client";

import { Pen } from "lucide-react";
import Image from "next/image";

import { Field } from "@/components/ui/field";
import type { ProfileForm as ProfileFormValues } from "@/features/profiles/schemas/profile";

type ProfileFormProps = {
  id?: string;
  defaultValues?: Partial<ProfileFormValues>;
  action: (formData: FormData) => void;
  avatar?: string;
  avatarId?: string;
  error?: string;
  onAvatarClickAction?: () => void;
};

export function ProfileForm({
  id,
  defaultValues,
  action,
  avatar = "/images/avatar-placeholder.svg",
  avatarId,
  error,
  onAvatarClickAction,
}: ProfileFormProps) {
  return (
    <form id={id} action={action} className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={onAvatarClickAction}
        className="group relative size-33 overflow-hidden rounded-lg"
      >
        <Image
          src={avatar}
          alt="Profile avatar"
          width={132}
          height={132}
          className="size-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <Pen className="size-8 text-foreground" />
        </div>
      </button>

      <input type="hidden" name="avatarId" value={avatarId ?? ""} />

      <div className="w-76">
        <Field
          label="name"
          name="name"
          type="text"
          placeholder="Profile name"
          defaultValue={defaultValues?.name}
          maxLength={30}
          required
          error={error}
        />
      </div>
    </form>
  );
}
