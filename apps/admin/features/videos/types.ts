export type VideoOwnerType = "episode" | "trailer";

export type VideoStatus = "pending" | "processing" | "ready" | "failed";

export interface Video {
  id: string;
  ownerType: VideoOwnerType;
  ownerId: string;
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
  ownerType: VideoOwnerType | null;
  ownerId: string | null;
  ownerTitle: string | null;
  videoId: string | null;
  uploadId: string | null;
  totalChunks: number;
  uploadedChunks: number;
  error: string | null;
}
