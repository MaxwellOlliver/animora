"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@/features/auth/lib/tokens";
import type { UploadProgress } from "./types";
import {
  completeUpload,
  getVideoStatusStreamUrl,
  initUpload,
  uploadChunk,
} from "./api";

interface VideoUploadContextValue {
  progress: UploadProgress;
  startUpload: (
    episodeId: string,
    episodeTitle: string,
    file: File,
  ) => Promise<void>;
  isUploading: boolean;
  dismiss: () => void;
}

const initialProgress: UploadProgress = {
  phase: "idle",
  episodeId: null,
  episodeTitle: null,
  videoId: null,
  uploadId: null,
  totalChunks: 0,
  uploadedChunks: 0,
  error: null,
};

const VideoUploadContext = createContext<VideoUploadContextValue | null>(null);

export function useVideoUpload() {
  const ctx = useContext(VideoUploadContext);
  if (!ctx)
    throw new Error("useVideoUpload must be used within VideoUploadProvider");
  return ctx;
}

const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB — matches API
const MAX_CONCURRENT_CHUNKS = 3;

export function VideoUploadProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [progress, setProgress] = useState<UploadProgress>(initialProgress);
  const abortRef = useRef(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();
    };
  }, []);

  const isUploading =
    progress.phase === "uploading" ||
    progress.phase === "completing" ||
    progress.phase === "processing";

  const dismiss = useCallback(() => {
    if (!isUploading) {
      setProgress(initialProgress);
    }
  }, [isUploading]);

  const startUpload = useCallback(
    async (episodeId: string, episodeTitle: string, file: File) => {
      if (isUploading) return;
      abortRef.current = false;

      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

      setProgress({
        phase: "uploading",
        episodeId,
        episodeTitle,
        videoId: null,
        uploadId: null,
        totalChunks,
        uploadedChunks: 0,
        error: null,
      });

      try {
        // 1. Init upload
        const { uploadId } = await initUpload(episodeId, totalChunks);
        setProgress((p) => ({ ...p, uploadId }));

        // 2. Upload chunks with concurrency
        let uploaded = 0;
        const chunks = Array.from({ length: totalChunks }, (_, i) => i);

        const uploadNextChunk = async () => {
          while (chunks.length > 0) {
            if (abortRef.current) return;
            const index = chunks.shift()!;
            const start = index * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, file.size);
            const blob = file.slice(start, end);

            await uploadChunk(uploadId, index, blob);
            uploaded++;
            setProgress((p) => ({ ...p, uploadedChunks: uploaded }));
          }
        };

        const workers = Array.from(
          { length: Math.min(MAX_CONCURRENT_CHUNKS, totalChunks) },
          () => uploadNextChunk(),
        );
        await Promise.all(workers);

        if (abortRef.current) return;

        // 3. Complete upload
        setProgress((p) => ({ ...p, phase: "completing" }));
        const { videoId } = await completeUpload(uploadId);

        setProgress((p) => ({
          ...p,
          phase: "processing",
          videoId,
        }));

        // 4. Listen for processing status via SSE
        const token = getAccessToken();
        const sseUrl = `${getVideoStatusStreamUrl(videoId)}?token=${token}`;
        const eventSource = new EventSource(sseUrl);
        eventSourceRef.current = eventSource;

        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.status === "ready") {
            eventSource.close();
            eventSourceRef.current = null;
            setProgress((p) => ({ ...p, phase: "ready" }));
            queryClient.invalidateQueries({ queryKey: ["episodes"] });
            queryClient.invalidateQueries({
              queryKey: ["video", episodeId],
            });
          } else if (data.status === "failed") {
            eventSource.close();
            eventSourceRef.current = null;
            setProgress((p) => ({
              ...p,
              phase: "failed",
              error: "Video processing failed.",
            }));
          }
        };

        eventSource.onerror = () => {
          eventSource.close();
          eventSourceRef.current = null;
          setProgress((p) => ({
            ...p,
            phase: "failed",
            error: "Lost connection to processing status.",
          }));
        };
      } catch (err) {
        setProgress((p) => ({
          ...p,
          phase: "failed",
          error: err instanceof Error ? err.message : "Upload failed.",
        }));
      }
    },
    [isUploading, queryClient],
  );

  return (
    <VideoUploadContext.Provider
      value={{ progress, startUpload, isUploading, dismiss }}
    >
      {children}
    </VideoUploadContext.Provider>
  );
}
