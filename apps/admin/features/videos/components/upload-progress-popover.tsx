"use client";

import { usePathname } from "next/navigation";
import { CheckCircle2, Loader2, Upload, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useVideoUpload } from "../video-upload-context";

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-all duration-300"
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

export function UploadProgressPopover() {
  const { progress, isUploading, dismiss } = useVideoUpload();
  const pathname = usePathname();

  // Don't show if idle or user is on the video page
  if (progress.phase === "idle") return null;

  const isOnVideoPage =
    progress.ownerId &&
    pathname === `/${progress.ownerType}s/${progress.ownerId}/video`;
  if (isOnVideoPage) return null;

  const percentage =
    progress.totalChunks > 0
      ? Math.round((progress.uploadedChunks / progress.totalChunks) * 100)
      : 0;

  const isTerminal = progress.phase === "ready" || progress.phase === "failed";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8"
          aria-label="Upload progress"
        >
          {progress.phase === "uploading" || progress.phase === "completing" ? (
            <Upload className="size-4 animate-pulse" />
          ) : progress.phase === "processing" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : progress.phase === "ready" ? (
            <CheckCircle2 className="size-4 text-emerald-500" />
          ) : (
            <XCircle className="size-4 text-destructive" />
          )}
          {isUploading && (
            <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-primary" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {progress.phase === "uploading"
                ? "Uploading video..."
                : progress.phase === "completing"
                  ? "Finalizing upload..."
                  : progress.phase === "processing"
                    ? "Processing video..."
                    : progress.phase === "ready"
                      ? "Video ready"
                      : "Upload failed"}
            </p>
            {progress.ownerTitle && (
              <p className="text-xs text-muted-foreground truncate">
                {progress.ownerTitle}
              </p>
            )}
          </div>

          {progress.phase === "uploading" && (
            <>
              <ProgressBar value={percentage} />
              <p className="text-xs text-muted-foreground tabular-nums">
                {progress.uploadedChunks} / {progress.totalChunks} chunks ({percentage}%)
              </p>
            </>
          )}

          {progress.phase === "processing" && (
            <p className="text-xs text-muted-foreground">
              Transcoding to multiple qualities. This may take a while.
            </p>
          )}

          {progress.error && (
            <p className="text-xs text-destructive">{progress.error}</p>
          )}

          {isTerminal && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={dismiss}
            >
              Dismiss
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
