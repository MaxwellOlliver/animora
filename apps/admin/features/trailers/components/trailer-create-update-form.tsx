"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { FormSection } from "@/components/form-section";
import { FormSectionGroup } from "@/components/form-section-group";
import { Grid } from "@/components/grid";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  createDefaultPhotoValue,
  PhotoUploadField,
  type PhotoUploadValue,
} from "@/components/ui/photo-upload-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePlaylistsList } from "@/features/playlists/hooks";
import { useSeriesList } from "@/features/series/hooks";
import { getMediaImageUrl } from "@/lib/s3";

import type { Media } from "../types";

const trailerSchema = z.object({
  seriesId: z.string().min(1, "Series is required."),
  playlistId: z.string().optional(),
  number: z
    .number()
    .int("Number must be an integer.")
    .min(1, "Number must be at least 1."),
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(255, "Title must be at most 255 characters."),
  durationSeconds: z
    .number()
    .int("Duration must be an integer.")
    .min(0, "Duration must be at least 0."),
});

type TrailerFormValues = z.infer<typeof trailerSchema>;

export interface TrailerCreateUpdateValues {
  seriesId: string;
  playlistId?: string;
  number: number;
  title: string;
  durationSeconds: number;
  photo: PhotoUploadValue;
}

interface TrailerCreateUpdateFormProps {
  mode: "create" | "update";
  initialValues?: {
    seriesId?: string;
    playlistId?: string | null;
    number?: number;
    title?: string;
    durationSeconds?: number;
    thumbnail?: Media | null;
  };
  onSubmit: (values: TrailerCreateUpdateValues) => Promise<void> | void;
  isSubmitting?: boolean;
  submitError?: string | null;
  cancelHref?: string;
}

export function TrailerCreateUpdateForm({
  mode,
  initialValues,
  onSubmit,
  isSubmitting = false,
  submitError,
  cancelHref = "/trailers",
}: TrailerCreateUpdateFormProps) {
  const seriesFieldId = useId();
  const playlistFieldId = useId();
  const numberId = useId();
  const titleId = useId();
  const durationId = useId();
  const [localError, setLocalError] = useState<string | null>(null);

  const seriesQuery = useSeriesList();
  const allSeries =
    seriesQuery.data?.pages.flatMap((page) => page.items) ?? [];

  const defaultPhotoUrl = initialValues?.thumbnail
    ? getMediaImageUrl(
        initialValues.thumbnail.purpose,
        initialValues.thumbnail.key,
      )
    : null;
  const [photoValue, setPhotoValue] = useState<PhotoUploadValue>(
    createDefaultPhotoValue(defaultPhotoUrl),
  );

  const form = useForm<TrailerFormValues>({
    resolver: zodResolver(trailerSchema),
    defaultValues: {
      seriesId: initialValues?.seriesId ?? "",
      playlistId: initialValues?.playlistId ?? undefined,
      number: initialValues?.number ?? 1,
      title: initialValues?.title ?? "",
      durationSeconds: initialValues?.durationSeconds ?? 0,
    },
  });

  const watchedSeriesId = form.watch("seriesId");
  const playlistsQuery = usePlaylistsList(watchedSeriesId || undefined);
  const allPlaylists = playlistsQuery.data ?? [];

  useEffect(() => {
    form.reset({
      seriesId: initialValues?.seriesId ?? "",
      playlistId: initialValues?.playlistId ?? undefined,
      number: initialValues?.number ?? 1,
      title: initialValues?.title ?? "",
      durationSeconds: initialValues?.durationSeconds ?? 0,
    });
  }, [
    form,
    initialValues?.seriesId,
    initialValues?.playlistId,
    initialValues?.number,
    initialValues?.title,
    initialValues?.durationSeconds,
  ]);

  const isBusy = isSubmitting || form.formState.isSubmitting;
  const errorMessage = localError ?? submitError ?? null;
  const submitLabel = mode === "create" ? "Create trailer" : "Save changes";

  const handleSubmit = form.handleSubmit(async (values) => {
    setLocalError(null);

    try {
      await onSubmit({
        seriesId: values.seriesId,
        playlistId: values.playlistId || undefined,
        number: values.number,
        title: values.title,
        durationSeconds: values.durationSeconds,
        photo: photoValue,
      });
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : "Failed to save trailer.",
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
                <FieldLabel htmlFor={seriesFieldId}>Series</FieldLabel>
                <Controller
                  control={form.control}
                  name="seriesId"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isBusy || seriesQuery.isLoading}
                    >
                      <SelectTrigger
                        id={seriesFieldId}
                        className="w-full"
                        aria-invalid={!!form.formState.errors.seriesId}
                      >
                        <SelectValue
                          placeholder={
                            seriesQuery.isLoading
                              ? "Loading..."
                              : "Select a series"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {allSeries.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[form.formState.errors.seriesId]} />
              </Field>
            )}

            <Field>
              <FieldLabel htmlFor={playlistFieldId}>
                Playlist (optional)
              </FieldLabel>
              <Controller
                control={form.control}
                name="playlistId"
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(v) => field.onChange(v || undefined)}
                    disabled={isBusy || !watchedSeriesId || playlistsQuery.isLoading}
                  >
                    <SelectTrigger
                      id={playlistFieldId}
                      className="w-full"
                    >
                      <SelectValue
                        placeholder={
                          !watchedSeriesId
                            ? "Select a series first"
                            : playlistsQuery.isLoading
                              ? "Loading..."
                              : "None"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {allPlaylists.map((p) => {
                        const label =
                          p.title ??
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
            </Field>

            <Grid>
              <Field>
                <FieldLabel htmlFor={numberId}>Trailer number</FieldLabel>
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
                  placeholder="e.g. Official Trailer"
                  disabled={isBusy}
                  aria-invalid={!!form.formState.errors.title}
                  {...form.register("title")}
                />
                <FieldError errors={[form.formState.errors.title]} />
              </Field>
            </Grid>

            <Field>
              <FieldLabel htmlFor={durationId}>
                Duration (seconds)
              </FieldLabel>
              <Input
                id={durationId}
                type="number"
                min={0}
                placeholder="e.g. 120"
                disabled={isBusy}
                aria-invalid={!!form.formState.errors.durationSeconds}
                {...form.register("durationSeconds", { valueAsNumber: true })}
              />
              <FieldError errors={[form.formState.errors.durationSeconds]} />
            </Field>
          </FieldGroup>
        </FormSection>
        <FormSection title="Thumbnail" className="min-w-min" separator={false}>
          <FieldGroup>
            <PhotoUploadField
              value={photoValue}
              onChange={setPhotoValue}
              label="Trailer thumbnail"
              description="Upload a thumbnail image for this trailer."
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
