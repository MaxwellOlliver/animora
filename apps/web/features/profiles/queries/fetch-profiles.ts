import { api } from "@/lib/api";

export type Profile = {
  id: string;
  userId: string;
  name: string;
  avatarId: string;
  createdAt: string;
  updatedAt: string;
};

export function fetchProfiles() {
  return api<Profile[]>("/profiles");
}
