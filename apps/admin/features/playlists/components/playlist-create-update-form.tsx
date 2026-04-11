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
import { useSeriesList } from "@/features/series/hooks";
import { getMediaImageUrl } from "@/lib/s3";

import type { Media, PlaylistStatus, PlaylistType } from "../types";

const playlistSchema = z.object({
  seriesId: z.string().min(1, "Series is required."),
  type: z.enum(["season", "movie", "special"]),
  status: z.enum(["upcoming", "airing", "finished", ""]),
  number: z
    .number()
    .int("Number must be an integer.")
    .min(1, "Number must be at least 1."),
  title: z.string().trim().max(255, "Title must be at most 255 characters."),
  studio: z.string().trim().max(255, "Studio must be at most 255 characters."),
  airStartDate: z.string(),
  airEndDate: z.string(),
});

type PlaylistFormValues = z.infer<typeof playlistSchema>;

export interface PlaylistCreateUpdateValues {
  seriesId: string;
  type: PlaylistType;
  number: number;
  title?: string;
  status?: PlaylistStatus;
  studio?: string;
  airStartDate?: string;
  airEndDate?: string;
  photo: PhotoUploadValue;
}

interface PlaylistCreateUpdateFormProps {
  mode: "create" | "update";
  initialValues?: {
    seriesId?: string;
    type?: PlaylistType;
    status?: PlaylistStatus | null;
    number?: number;
    title?: string | null;
    studio?: string | null;
    airStartDate?: string | null;
    airEndDate?: string | null;
    cover?: Media | null;
  };
  onSubmit: (values: PlaylistCreateUpdateValues) => Promise<void> | void;
  isSubmitting?: boolean;
  submitError?: string | null;
  cancelHref?: string;
}

export function PlaylistCreateUpdateForm({
  mode,
  initialValues,
  onSubmit,
  isSubmitting = false,
  submitError,
  cancelHref = "/playlists",
}: PlaylistCreateUpdateFormProps) {
  const seriesFieldId = useId();
  const typeId = useId();
  const statusId = useId();
  const numberId = useId();
  const titleId = useId();
  const studioId = useId();
  const airStartId = useId();
  const airEndId = useId();
  const [localError, setLocalError] = useState<string | null>(null);

  const seriesQuery = useSeriesList();
  const allSeries = seriesQuery.data?.pages.flatMap((p) => p.items) ?? [];

  const defaultPhotoUrl = initialValues?.cover
    ? getMediaImageUrl(initialValues.cover.purpose, initialValues.cover.key)
    : null;
  const [photoValue, setPhotoValue] = useState<PhotoUploadValue>(
    createDefaultPhotoValue(defaultPhotoUrl),
  );

  const form = useForm<PlaylistFormValues>({
    resolver: zodResolver(playlistSchema),
    defaultValues: {
      seriesId: initialValues?.seriesId ?? "",
      type: initialValues?.type ?? "season",
      status: initialValues?.status ?? "",
      number: initialValues?.number ?? 1,
      title: initialValues?.title ?? "",
      studio: initialValues?.studio ?? "",
      airStartDate: initialValues?.airStartDate ?? "",
      airEndDate: initialValues?.airEndDate ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      seriesId: initialValues?.seriesId ?? "",
      type: initialValues?.type ?? "season",
      status: initialValues?.status ?? "",
      number: initialValues?.number ?? 1,
      title: initialValues?.title ?? "",
      studio: initialValues?.studio ?? "",
      airStartDate: initialValues?.airStartDate ?? "",
      airEndDate: initialValues?.airEndDate ?? "",
    });
  }, [
    form,
    initialValues?.seriesId,
    initialValues?.type,
    initialValues?.status,
    initialValues?.number,
    initialValues?.title,
    initialValues?.studio,
    initialValues?.airStartDate,
    initialValues?.airEndDate,
  ]);

  const isBusy = isSubmitting || form.formState.isSubmitting;
  const errorMessage = localError ?? submitError ?? null;
  const submitLabel = mode === "create" ? "Create playlist" : "Save changes";

  const handleSubmit = form.handleSubmit(async (values) => {
    setLocalError(null);
    const normalizedTitle = values.title.trim();
    const normalizedStudio = values.studio.trim();

    try {
      await onSubmit({
        seriesId: values.seriesId,
        type: values.type,
        number: values.number,
        title: normalizedTitle || undefined,
        status: (values.status as PlaylistStatus) || undefined,
        studio: normalizedStudio || undefined,
        airStartDate: values.airStartDate || undefined,
        airEndDate: values.airEndDate || undefined,
        photo: photoValue,
      });
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : "Failed to save playlist.",
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

            <Grid>
              <Field>
                <FieldLabel htmlFor={typeId}>Type</FieldLabel>
                <Controller
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isBusy}
                    >
                      <SelectTrigger
                        id={typeId}
                        className="w-full"
                        aria-invalid={!!form.formState.errors.type}
                      >
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="season">Season</SelectItem>
                        <SelectItem value="movie">Movie</SelectItem>
                        <SelectItem value="special">Special</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[form.formState.errors.type]} />
              </Field>

              <Field>
                <FieldLabel htmlFor={numberId}>Number</FieldLabel>
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
            </Grid>

            <Field>
              <FieldLabel htmlFor={titleId}>Title</FieldLabel>
              <Input
                id={titleId}
                placeholder="e.g. Mugen Train Arc (optional)"
                disabled={isBusy}
                aria-invalid={!!form.formState.errors.title}
                {...form.register("title")}
              />
              <FieldError errors={[form.formState.errors.title]} />
            </Field>
          </FieldGroup>
        </FormSection>
        <FormSection title="Cover" className="min-w-min" separator={false}>
          <FieldGroup>
            <PhotoUploadField
              value={photoValue}
              onChange={setPhotoValue}
              label="Playlist cover"
              description="Upload a cover image for this playlist."
              disabled={isBusy}
            />
          </FieldGroup>
        </FormSection>
      </FormSectionGroup>
      <FormSectionGroup>
        <FormSection title="Production" separator={false}>
          <Grid>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor={statusId}>Status</FieldLabel>
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isBusy}
                    >
                      <SelectTrigger
                        id={statusId}
                        className="w-full"
                        aria-invalid={!!form.formState.errors.status}
                      >
                        <SelectValue placeholder="Select a status (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="airing">Airing</SelectItem>
                        <SelectItem value="finished">Finished</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[form.formState.errors.status]} />
              </Field>

              <Field>
                <FieldLabel htmlFor={studioId}>Studio</FieldLabel>
                <Input
                  id={studioId}
                  placeholder="e.g. MAPPA, WIT Studio (optional)"
                  disabled={isBusy}
                  aria-invalid={!!form.formState.errors.studio}
                  {...form.register("studio")}
                />
                <FieldError errors={[form.formState.errors.studio]} />
              </Field>
            </FieldGroup>
          </Grid>
        </FormSection>
        <FormSection title="Airing Dates" separator={false}>
          <Grid>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor={airStartId}>Start Date</FieldLabel>
                <Input
                  id={airStartId}
                  type="date"
                  disabled={isBusy}
                  aria-invalid={!!form.formState.errors.airStartDate}
                  {...form.register("airStartDate")}
                />
                <FieldError errors={[form.formState.errors.airStartDate]} />
              </Field>

              <Field>
                <FieldLabel htmlFor={airEndId}>End Date</FieldLabel>
                <Input
                  id={airEndId}
                  type="date"
                  disabled={isBusy}
                  aria-invalid={!!form.formState.errors.airEndDate}
                  {...form.register("airEndDate")}
                />
                <FieldError errors={[form.formState.errors.airEndDate]} />
              </Field>
            </FieldGroup>
          </Grid>
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
