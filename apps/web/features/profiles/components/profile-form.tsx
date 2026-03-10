"use client";

import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pen } from "lucide-react";
import { Field } from "@/app/components/ui/field";
import {
  profileSchema,
  type ProfileForm as ProfileFormValues,
} from "@/features/profiles/schemas/profile";

type ProfileFormProps = {
  id?: string;
  defaultValues?: Partial<ProfileFormValues>;
  action: (data: ProfileFormValues) => void;
  avatar?: string;
  onAvatarClickAction?: () => void;
};

export function ProfileForm({
  id,
  defaultValues,
  action,
  avatar = "/images/avatar-placeholder.svg",
  onAvatarClickAction,
}: ProfileFormProps) {
  const { register, handleSubmit } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  return (
    <form
      id={id}
      onSubmit={handleSubmit(action)}
      className="flex flex-col items-center gap-4"
    >
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

      <div className="w-76">
        <Field
          label="name"
          type="text"
          placeholder="Profile name"
          {...register("name")}
        />
      </div>
    </form>
  );
}
