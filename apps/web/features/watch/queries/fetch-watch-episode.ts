import { api } from "@/lib/api";
import type { Media } from "@/features/catalog/queries/fetch-recommended";

export type WatchEpisodePayload = {
  episode: {
    id: string;
    playlistId: string;
    number: number;
    title: string;
    description: string | null;
    thumbnailId: string | null;
    durationSeconds: number | null;
    createdAt: string;
    updatedAt: string;
    playlist: {
      id: string;
      number: number;
      title: string | null;
      type: string;
    };
    series: {
      id: string;
      name: string;
    };
  };
  thumbnail: Media | null;
  video: {
    id: string;
    ownerType: string;
    ownerId: string;
    status: "pending" | "processing" | "ready" | "failed";
    rawObjectKey: string | null;
    masterPlaylistKey: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  nextEpisode: {
    id: string;
    playlistId: string;
    number: number;
    title: string;
    description: string | null;
    thumbnailId: string | null;
    durationSeconds: number | null;
    createdAt: string;
    updatedAt: string;
    thumbnail: Media | null;
  } | null;
};

export async function fetchWatchEpisode(
  episodeId: string,
): Promise<WatchEpisodePayload> {
  return api<WatchEpisodePayload>(`/streaming/watch/${episodeId}`, {
    auth: false,
  });
}
