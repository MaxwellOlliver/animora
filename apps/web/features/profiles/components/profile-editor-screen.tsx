"use client";

import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";

import { AvatarPickerModal } from "@/features/profiles/components/avatar-picker-modal";
import { ProfileForm } from "@/features/profiles/components/profile-form";
import { getAvatarImageUrl, type ProfileAvatar } from "@/features/profiles/queries/fetch-avatars";
import type { ActionResult } from "@/lib/action";

type ProfileEditorScreenProps = {
  title: string;
  submitAction: (
    state: ActionResult,
    payload: FormData,
  ) => ActionResult | Promise<ActionResult>;
  defaultName?: string;
  defaultAvatarId?: string;
  defaultAvatarPreview?: string;
};

export function ProfileEditorScreen({
  title,
  submitAction,
  defaultName,
  defaultAvatarId,
  defaultAvatarPreview,
}: ProfileEditorScreenProps) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    submitAction,
    {},
  );
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [avatarId, setAvatarId] = useState<string | undefined>(defaultAvatarId);
  const [avatarPreview, setAvatarPreview] = useState(
    defaultAvatarPreview ?? "/images/avatar-placeholder.svg",
  );

  function handleAvatarChange(avatar: ProfileAvatar) {
    setAvatarId(avatar.id);
    setAvatarPreview(getAvatarImageUrl(avatar));
  }

  return (
    <main className="relative flex h-screen items-center justify-center overflow-hidden bg-background p-6">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-225"
        style={{
          background:
            "radial-gradient(circle, rgba(243,78,122,0.03) 0%, transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center">
        <h1 className="font-heading text-4xl font-semibold leading-12 text-foreground">
          {title}
        </h1>

        <div className="mt-11">
          <ProfileForm
            id="profile-form"
            defaultValues={{ name: defaultName }}
            action={formAction}
            avatar={avatarPreview}
            avatarId={avatarId}
            error={state.error}
            onAvatarClickAction={() => setAvatarOpen(true)}
          />
        </div>

        <nav className="mt-16 flex flex-col items-center gap-5">
          <button
            type="submit"
            form="profile-form"
            className="flex items-center gap-2 text-primary/80 transition-colors hover:text-primary disabled:opacity-50"
            disabled={pending}
          >
            {pending ? <Loader2 className="size-6 animate-spin" /> : <Save className="size-6" />}
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
        value={avatarId}
        onChange={handleAvatarChange}
      />
    </main>
  );
}
