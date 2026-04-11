"use client";

import type { MediaPurpose } from "@animora/contracts";
import { ArrowLeft, Check,Pen } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { NewProfileCard } from "@/features/profiles/components/new-profile-card";
import { ProfileCard } from "@/features/profiles/components/profile-card";
import type { Profile } from "@/features/profiles/queries/fetch-profiles";
import { buildMediaUrl } from "@/utils/media-utils";

export function ProfileSelectionView({ profiles }: { profiles: Profile[] }) {
  const searchParams = useSearchParams();
  const fromAuth = searchParams.get("from") === "auth";
  const [editing, setEditing] = useState(false);

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
          Who is watching?
        </h1>

        <div className="mt-11 flex gap-6">
          {profiles.map((profile) => {
            const avatarUrl =
              profile.avatar?.picture
                ? buildMediaUrl(
                    profile.avatar.picture.purpose as MediaPurpose,
                    profile.avatar.picture.key,
                  )
                : "/images/avatar-placeholder.svg";

            return (
              <ProfileCard
                key={profile.id}
                id={profile.id}
                name={profile.name}
                avatar={avatarUrl}
                editing={editing}
              />
            );
          })}
          <NewProfileCard />
        </div>

        <nav className="mt-16 flex flex-col items-center gap-5">
          <button
            onClick={() => setEditing(!editing)}
            className="flex items-center gap-2 text-foreground-muted transition-colors hover:text-foreground"
          >
            {editing ? (
              <Check className="size-6" />
            ) : (
              <Pen className="size-6" />
            )}
            <span className="text-xl font-medium">
              {editing ? "done" : "manage profiles"}
            </span>
          </button>
          {!fromAuth && (
            <Link
              href="/sign-in"
              className="flex items-center gap-2 text-foreground-muted transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-6" />
              <span className="text-xl font-medium">go back</span>
            </Link>
          )}
        </nav>
      </div>
    </main>
  );
}
