import { apiClient } from "@/lib/api-client";

import type { Playlist, PlaylistStatus, PlaylistType } from "./types";

export interface CreatePlaylistInput {
  seriesId: string;
  type: PlaylistType;
  number: number;
  title?: string;
  status?: PlaylistStatus;
  studio?: string;
  airStartDate?: string;
  airEndDate?: string;
}

export interface UpdatePlaylistInput {
  type?: PlaylistType;
  number?: number;
  title?: string;
  status?: PlaylistStatus;
  studio?: string;
  airStartDate?: string;
  airEndDate?: string;
}

export async function fetchPlaylists(seriesId?: string): Promise<Playlist[]> {
  const params = seriesId ? `?seriesId=${seriesId}` : "";
  return apiClient<Playlist[]>(`/admin/playlists${params}`);
}

export async function fetchPlaylistById(id: string): Promise<Playlist> {
  return apiClient<Playlist>(`/admin/playlists/${id}`);
}

export async function createPlaylist(
  input: CreatePlaylistInput,
): Promise<Playlist> {
  return apiClient<Playlist>("/admin/playlists", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updatePlaylist(
  id: string,
  input: UpdatePlaylistInput,
): Promise<Playlist> {
  return apiClient<Playlist>(`/admin/playlists/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deletePlaylist(id: string): Promise<void> {
  await apiClient(`/admin/playlists/${id}`, {
    method: "DELETE",
  });
}

export async function uploadPlaylistCover(
  id: string,
  file: File,
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);

  await apiClient<void>(`/admin/playlists/${id}/cover`, {
    method: "POST",
    body: formData,
  });
}
