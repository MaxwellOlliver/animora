import { apiClient } from "@/lib/api-client";
import type { InitUploadResult, Video, VideoOwnerType } from "./types";

export async function fetchVideoByOwner(
  ownerType: VideoOwnerType,
  ownerId: string,
): Promise<Video> {
  return apiClient<Video>(`/admin/${ownerType}s/${ownerId}/video`);
}

export async function deleteVideo(id: string): Promise<void> {
  await apiClient(`/admin/videos/${id}`, { method: "DELETE" });
}

export async function initUpload(
  ownerType: VideoOwnerType,
  ownerId: string,
  totalChunks: number,
): Promise<InitUploadResult> {
  return apiClient<InitUploadResult>(
    `/admin/${ownerType}s/${ownerId}/uploads/init`,
    {
      method: "POST",
      body: JSON.stringify({ totalChunks }),
    },
  );
}

export async function uploadChunk(
  uploadId: string,
  index: number,
  chunk: Blob,
): Promise<{ index: number; received: boolean }> {
  const formData = new FormData();
  formData.append("file", chunk, `chunk-${index}`);

  return apiClient<{ index: number; received: boolean }>(
    `/admin/uploads/${uploadId}/chunk/${index}`,
    { method: "POST", body: formData },
  );
}

export async function completeUpload(
  uploadId: string,
): Promise<{ videoId: string; status: string }> {
  return apiClient<{ videoId: string; status: string }>(
    `/admin/uploads/${uploadId}/complete`,
    { method: "POST" },
  );
}

export function getVideoStatusStreamUrl(videoId: string): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
  return `${apiUrl}/admin/videos/${videoId}/status/stream`;
}

export function getHlsUrl(masterPlaylistKey: string): string {
  const s3Endpoint = process.env.NEXT_PUBLIC_S3_ENDPOINT ?? "http://localhost:9000";
  const bucket = process.env.NEXT_PUBLIC_S3_BUCKET ?? "animora";
  return `${s3Endpoint}/${bucket}/${masterPlaylistKey}`;
}
