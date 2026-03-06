"use client";

import * as React from "react";
import { ImagePlus } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PhotoUploadValue =
  | {
      kind: "default";
      url: string | null;
    }
  | {
      kind: "new";
      file: File;
      previewUrl: string;
      previousUrl: string | null;
    };

export function createDefaultPhotoValue(url: string | null): PhotoUploadValue {
  return { kind: "default", url };
}

interface PhotoUploadFieldProps {
  value: PhotoUploadValue;
  onChange: (value: PhotoUploadValue) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function PhotoUploadField({
  value,
  onChange,
  label = "Photo",
  description = "Upload an image file.",
  disabled = false,
  className,
}: PhotoUploadFieldProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (value.kind !== "new") return;
    return () => URL.revokeObjectURL(value.previewUrl);
  }, [value]);

  const previewUrl = value.kind === "new" ? value.previewUrl : value.url;

  function openFileDialog() {
    inputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const previousUrl = value.kind === "new" ? value.previousUrl : value.url;
    onChange({
      kind: "new",
      file,
      previewUrl: URL.createObjectURL(file),
      previousUrl,
    });
  }

  function keepCurrentPhoto() {
    if (value.kind !== "new") return;
    onChange(createDefaultPhotoValue(value.previousUrl));
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-0.5">
        <p className="text-sm font-medium leading-none">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="flex items-start gap-4">
        <div className="relative flex size-20 items-center justify-center overflow-hidden rounded-md border bg-muted">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt=""
              fill
              sizes="80px"
              unoptimized
              className="object-cover"
              loading="lazy"
            />
          ) : (
            <ImagePlus className="size-5 text-muted-foreground" aria-hidden="true" />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={openFileDialog}
            disabled={disabled}
          >
            {value.kind === "new" ? "Change photo" : "Upload photo"}
          </Button>

          {value.kind === "new" && (
            <Button
              type="button"
              variant="ghost"
              onClick={keepCurrentPhoto}
              disabled={disabled}
            >
              Keep current photo
            </Button>
          )}

          {value.kind === "new" && (
            <p className="text-xs text-muted-foreground">
              New file selected: {value.file.name}
            </p>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFileChange}
        disabled={disabled}
      />
    </div>
  );
}
