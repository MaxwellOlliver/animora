"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  createDefaultPhotoValue,
  PhotoUploadField,
  type PhotoUploadValue,
} from "@/components/ui/photo-upload-field";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormSection } from "@/components/form-section";
import { FormSectionGroup } from "@/components/form-section-group";
import { Grid } from "@/components/grid";
import { getMediaImageUrl } from "@/lib/s3";
import { usePlaylistsList } from "@/features/playlists/hooks";
import type { Media } from "../types";

const episodeSchema = z.object({
  playlistId: z.string().min(1, "Playlist is required."),
  number: z
    .number()
    .int("Number must be an integer.")
    .min(1, "Number must be at least 1."),
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(255, "Title must be at most 255 characters."),
  description: z.string(),
});

type EpisodeFormValues = z.infer<typeof episodeSchema>;

export interface EpisodeCreateUpdateValues {
  playlistId: string;
  number: number;
  title: string;
  description?: string;
  photo: PhotoUploadValue;
}

interface EpisodeCreateUpdateFormProps {
  mode: "create" | "update";
  initialValues?: {
    playlistId?: string;
    number?: number;
    title?: string;
    description?: string | null;
    thumbnail?: Media | null;
  };
  onSubmit: (values: EpisodeCreateUpdateValues) => Promise<void> | void;
  isSubmitting?: boolean;
  submitError?: string | null;
  cancelHref?: string;
}

export function EpisodeCreateUpdateForm({
  mode,
  initialValues,
  onSubmit,
  isSubmitting = false,
  submitError,
  cancelHref = "/episodes",
}: EpisodeCreateUpdateFormProps) {
  const playlistFieldId = useId();
  const numberId = useId();
  const titleId = useId();
  const descriptionId = useId();
  const [localError, setLocalError] = useState<string | null>(null);

  const playlistsQuery = usePlaylistsList();
  const allPlaylists = playlistsQuery.data ?? [];

  const defaultPhotoUrl = initialValues?.thumbnail
    ? getMediaImageUrl(
        initialValues.thumbnail.purpose,
        initialValues.thumbnail.key,
      )
    : null;
  const [photoValue, setPhotoValue] = useState<PhotoUploadValue>(
    createDefaultPhotoValue(defaultPhotoUrl),
  );

  const form = useForm<EpisodeFormValues>({
    resolver: zodResolver(episodeSchema),
    defaultValues: {
      playlistId: initialValues?.playlistId ?? "",
      number: initialValues?.number ?? 1,
      title: initialValues?.title ?? "",
      description: initialValues?.description ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      playlistId: initialValues?.playlistId ?? "",
      number: initialValues?.number ?? 1,
      title: initialValues?.title ?? "",
      description: initialValues?.description ?? "",
    });
  }, [
    form,
    initialValues?.playlistId,
    initialValues?.number,
    initialValues?.title,
    initialValues?.description,
  ]);

  const isBusy = isSubmitting || form.formState.isSubmitting;
  const errorMessage = localError ?? submitError ?? null;
  const submitLabel = mode === "create" ? "Create episode" : "Save changes";

  const handleSubmit = form.handleSubmit(async (values) => {
    setLocalError(null);
    const normalizedDescription = values.description.trim();

    try {
      await onSubmit({
        playlistId: values.playlistId,
        number: values.number,
        title: values.title,
        description: normalizedDescription || undefined,
        photo: photoValue,
      });
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : "Failed to save episode.",
      );
    }
  });

  return (
    <form onSubmit={handleSubmit}>
      {errorMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-4 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      <FormSectionGroup>
        <FormSection title="Details" separator={false}>
          <FieldGroup>
            {mode === "create" && (
              <Field>
                <FieldLabel htmlFor={playlistFieldId}>Playlist</FieldLabel>
                <Controller
                  control={form.control}
                  name="playlistId"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isBusy || playlistsQuery.isLoading}
                    >
                      <SelectTrigger
                        id={playlistFieldId}
                        className="w-full"
                        aria-invalid={!!form.formState.errors.playlistId}
                      >
                        <SelectValue
                          placeholder={
                            playlistsQuery.isLoading
                              ? "Loading..."
                              : "Select a playlist"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {allPlaylists.map((p) => {
                          const label = p.seriesName
                            ? `${p.seriesName} — ${p.title ?? `${p.type === "season" ? "Season" : p.type === "movie" ? "Movie" : "Special"} ${p.number}`}`
                            : p.title ??
                              `${p.type === "season" ? "Season" : p.type === "movie" ? "Movie" : "Special"} ${p.number}`;
                          return (
                            <SelectItem key={p.id} value={p.id}>
                              {label}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[form.formState.errors.playlistId]} />
              </Field>
            )}

            <Grid>
              <Field>
                <FieldLabel htmlFor={numberId}>Episode number</FieldLabel>
                <Input
                  id={numberId}
                  type="number"
                  min={1}
                  placeholder="e.g. 1"
                  disabled={isBusy}
                  aria-invalid={!!form.formState.errors.number}
                  {...form.register("number", { valueAsNumber: true })}
                />
                <FieldError errors={[form.formState.errors.number]} />
              </Field>

              <Field>
                <FieldLabel htmlFor={titleId}>Title</FieldLabel>
                <Input
                  id={titleId}
                  placeholder="e.g. To You, 2,000 Years From Now"
                  disabled={isBusy}
                  aria-invalid={!!form.formState.errors.title}
                  {...form.register("title")}
                />
                <FieldError errors={[form.formState.errors.title]} />
              </Field>
            </Grid>

            <Field>
              <FieldLabel htmlFor={descriptionId}>Description</FieldLabel>
              <Textarea
                id={descriptionId}
                placeholder="Write a brief description of the episode... (optional)"
                disabled={isBusy}
                className="min-h-24"
                {...form.register("description")}
              />
              <FieldError errors={[form.formState.errors.description]} />
            </Field>
          </FieldGroup>
        </FormSection>
        <FormSection title="Thumbnail" className="min-w-min" separator={false}>
          <FieldGroup>
            <PhotoUploadField
              value={photoValue}
              onChange={setPhotoValue}
              label="Episode thumbnail"
              description="Upload a thumbnail image for this episode."
              disabled={isBusy}
            />
          </FieldGroup>
        </FormSection>
      </FormSectionGroup>
      <div className="mt-8 flex gap-4 ">
        <Button type="submit" size="sm" disabled={isBusy}>
          {isBusy ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>
        <Button type="button" variant="ghost" size="sm" asChild>
          <Link href={cancelHref}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
