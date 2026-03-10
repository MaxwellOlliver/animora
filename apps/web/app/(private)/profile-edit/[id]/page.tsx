"use client";

import { useState } from "react";
import Link from "next/link";
import { Save, ArrowLeft } from "lucide-react";
import { ProfileForm } from "@/features/profiles/components/profile-form";
import { AvatarPickerModal } from "@/features/profiles/components/avatar-picker-modal";
import type { ProfileForm as ProfileFormValues } from "@/features/profiles/schemas/profile";

export default function ProfileEditPage() {
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [avatar, setAvatar] = useState("/images/avatar-placeholder.svg");

  function onSubmit(data: ProfileFormValues) {
    console.log({ ...data, avatar });
  }

  return (
    <main className="relative flex h-screen items-center justify-center overflow-hidden bg-background p-6">
      {/* Decorative gradient */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-225"
        style={{
          background:
            "radial-gradient(circle, rgba(243,78,122,0.03) 0%, transparent 70%)",
        }}
      />

      {/* Main content */}
      <div className="relative flex flex-col items-center">
        <h1 className="font-heading text-4xl font-semibold leading-12 text-foreground">
          Edit profile
        </h1>

        <div className="mt-11">
          <ProfileForm
            id="profile-form"
            defaultValues={{ name: "Maxwell" }}
            avatar={avatar}
            action={onSubmit}
            onAvatarClickAction={() => setAvatarOpen(true)}
          />
        </div>

        <nav className="mt-16 flex flex-col items-center gap-5">
          <button
            type="submit"
            form="profile-form"
            className="flex items-center gap-2 text-primary/80 transition-colors hover:text-primary"
          >
            <Save className="size-6" />
            <span className="text-xl font-medium">save</span>
          </button>
          <Link
            href="/profile-selection"
            className="flex items-center gap-2 text-foreground-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-6" />
            <span className="text-xl font-medium">go back</span>
          </Link>
        </nav>
      </div>

      <AvatarPickerModal
        open={avatarOpen}
        onOpenChangeAction={setAvatarOpen}
        selectedAvatar={avatar}
        onSelectAction={setAvatar}
      />
    </main>
  );
}
