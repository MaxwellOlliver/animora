import { apiClient } from "@/lib/api-client";
import type { Avatar } from "./types";

export interface CreateAvatarInput {
  name: string;
  active?: boolean;
  default?: boolean;
}

export interface UpdateAvatarInput {
  name?: string;
  active?: boolean;
  default?: boolean;
}

export async function fetchAvatars(): Promise<Avatar[]> {
  return apiClient<Avatar[]>("/admin/avatars");
}

export async function fetchAvatarById(id: string): Promise<Avatar> {
  return apiClient<Avatar>(`/admin/avatars/${id}`);
}

export async function createAvatar(input: CreateAvatarInput): Promise<Avatar> {
  return apiClient<Avatar>("/admin/avatars", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateAvatar(
  id: string,
  input: UpdateAvatarInput,
): Promise<Avatar> {
  return apiClient<Avatar>(`/admin/avatars/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteAvatar(id: string): Promise<void> {
  await apiClient(`/admin/avatars/${id}`, { method: "DELETE" });
}

export async function uploadAvatarPicture(
  id: string,
  file: File,
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);

  await apiClient<void>(`/admin/avatars/${id}/banner`, {
    method: "POST",
    body: formData,
  });
}
