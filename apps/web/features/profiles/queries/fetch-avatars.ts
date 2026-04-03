import { queryOptions } from "@tanstack/react-query";
import type { MediaPurpose } from "@animora/contracts";
import { env } from "@/lib/env";
import { buildMediaUrl } from "@/utils/media-utils";

export type AvatarMedia = {
  id: string;
  key: string;
  purpose: MediaPurpose;
  mimeType: string;
  createdAt: string;
};

export type ProfileAvatar = {
  id: string;
  name: string;
  pictureId: string | null;
  picture: AvatarMedia | null;
  active: boolean;
  default: boolean;
  createdAt: string;
};

export function getAvatarImageUrl(avatar: Pick<ProfileAvatar, "picture">) {
  if (!avatar.picture) {
    return "/images/avatar-placeholder.svg";
  }

  return buildMediaUrl(avatar.picture.purpose, avatar.picture.key);
}

async function fetchAvatars(): Promise<ProfileAvatar[]> {
  const response = await fetch("/api/proxy/avatars");

  if (!response.ok) {
    throw new Error(`Failed to fetch avatars: ${response.status}`);
  }

  return response.json();
}

export const avatarsQueryOptions = queryOptions({
  queryKey: ["profiles", "avatars"],
  queryFn: fetchAvatars,
});
