export type VideoStatus = "pending" | "processing" | "ready" | "failed";

export interface Video {
  id: string;
  episodeId: string;
  status: VideoStatus;
  rawObjectKey: string | null;
  masterPlaylistKey: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InitUploadResult {
  uploadId: string;
  chunkSize: number;
}

export interface UploadProgress {
  phase: "idle" | "uploading" | "completing" | "processing" | "ready" | "failed";
  episodeId: string | null;
  episodeTitle: string | null;
  videoId: string | null;
  uploadId: string | null;
  totalChunks: number;
  uploadedChunks: number;
  error: string | null;
}
