import type { MediaPurpose } from "@animora/contracts";
import { api } from "@/lib/api";

export type Profile = {
  id: string;
  userId: string;
  name: string;
  avatarId: string;
  avatar: {
    name: string;
    picture: { key: string; purpose: MediaPurpose } | null;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export function fetchProfiles() {
  return api<Profile[]>("/profiles");
}

export function fetchProfile(profileId: string) {
  return api<Profile>(`/profiles/${profileId}`);
}
