"use client";

import { useRef } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Loader2,
  Trash2,
  Upload,
  Video,
  XCircle,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEpisodeById } from "@/features/episodes/hooks";
import { getHlsUrl } from "@/features/videos/api";
import { VideoPlayer } from "@/features/videos/components/video-player";
import { useVideoByEpisodeId, useDeleteVideo } from "@/features/videos/hooks";
import { useVideoUpload } from "@/features/videos/video-upload-context";
import { ApiError } from "@/lib/api-client";

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-all duration-300"
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "pending":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-medium text-yellow-600">
          <span className="size-1.5 rounded-full bg-yellow-500" />
          Pending
        </span>
      );
    case "processing":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-600">
          <Loader2 className="size-3 animate-spin" />
          Processing
        </span>
      );
    case "ready":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
          <CheckCircle2 className="size-3" />
          Ready
        </span>
      );
    case "failed":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
          <XCircle className="size-3" />
          Failed
        </span>
      );
    default:
      return null;
  }
}

export default function EpisodeVideoPage() {
  const params = useParams<{ id: string }>();
  const episodeId = params.id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const episodeQuery = useEpisodeById(episodeId);
  const videoQuery = useVideoByEpisodeId(episodeId);
  const deleteMutation = useDeleteVideo();
  const { progress, startUpload, isUploading } = useVideoUpload();

  const episodeName = episodeQuery.data?.title ?? null;
  const video = videoQuery.data;
  const hasVideo =
    !!video &&
    !(videoQuery.error instanceof ApiError && videoQuery.error.status === 404);

  // Is this episode currently being uploaded?
  const isCurrentUpload = progress.episodeId === episodeId;
  const showUploadProgress = isCurrentUpload && progress.phase !== "idle";

  const percentage =
    progress.totalChunks > 0
      ? Math.round((progress.uploadedChunks / progress.totalChunks) * 100)
      : 0;

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !episodeQuery.data) return;
    startUpload(episodeId, episodeQuery.data.title, file);
    e.target.value = "";
  }

  function handleDelete() {
    if (!video) return;
    deleteMutation.mutate(video.id);
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/episodes">Episodes</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {episodeName ? `Video: ${episodeName}` : "Video"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {episodeName ? (
              <>
                Manage Video{" "}
                <span className="text-muted-foreground">&mdash;</span>{" "}
                <span className="text-primary/80">{episodeName}</span>
              </>
            ) : episodeQuery.isLoading ? (
              <span className="inline-flex items-center gap-3">
                Manage Video{" "}
                <Skeleton className="inline-block h-6 w-40 align-middle" />
              </span>
            ) : (
              "Manage Video"
            )}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload and manage the video file for this episode.
          </p>
        </div>

        {/* Upload progress (inline on this page) */}
        {showUploadProgress && (
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {progress.phase === "uploading"
                    ? "Uploading video..."
                    : progress.phase === "completing"
                      ? "Finalizing upload..."
                      : progress.phase === "processing"
                        ? "Processing video..."
                        : progress.phase === "ready"
                          ? "Video ready!"
                          : "Upload failed"}
                </p>
                {progress.phase === "uploading" && (
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {percentage}%
                  </span>
                )}
              </div>

              {progress.phase === "uploading" && (
                <>
                  <ProgressBar value={percentage} />
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {progress.uploadedChunks} / {progress.totalChunks} chunks
                    uploaded
                  </p>
                </>
              )}

              {progress.phase === "processing" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Transcoding to multiple qualities (360p, 720p, 1080p). This
                  may take several minutes.
                </div>
              )}

              {progress.phase === "ready" && (
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <CheckCircle2 className="size-4" />
                  Video has been processed and is ready for playback.
                </div>
              )}

              {progress.error && (
                <p className="text-sm text-destructive">{progress.error}</p>
              )}
            </div>
          </div>
        )}

        {/* Existing video info */}
        {hasVideo && !showUploadProgress && (
          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    <Video
                      className="size-5 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Video</p>
                    <p className="text-xs text-muted-foreground">
                      Uploaded{" "}
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(video.createdAt))}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={video.status} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    aria-label="Delete video"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </div>

            {video.status === "ready" && video.masterPlaylistKey && (
              <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                <div className="px-5 py-3">
                  <p className="text-sm font-medium">Preview</p>
                </div>
                <VideoPlayer
                  src={getHlsUrl(video.masterPlaylistKey)}
                  title={episodeName}
                />
              </div>
            )}
          </div>
        )}

        {/* Upload area — show when no video exists and no upload in progress */}
        {!hasVideo && !showUploadProgress && (
          <button
            type="button"
            className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-20 transition-colors hover:border-primary/50 hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
              <Upload
                className="size-5 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">
                {isUploading
                  ? "Another upload is in progress"
                  : "Click to upload video"}
              </p>
              <p className="text-xs text-muted-foreground">
                MP4, MKV, or AVI. The video will be transcoded to HLS.
              </p>
            </div>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
    </>
  );
}
