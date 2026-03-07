"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Check, ChevronsUpDown, Loader2, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Field,
  FieldDescription,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FormSection } from "@/components/form-section";
import { FormSectionGroup } from "@/components/form-section-group";
import { Grid } from "@/components/grid";
import { getMediaImageUrl } from "@/lib/s3";
import { cn } from "@/lib/utils";
import { useGenresList } from "@/features/genres/hooks";
import { useContentClassificationsList } from "@/features/classifications/hooks";
import type { Media } from "../types";

const seriesSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(255, "Name must be at most 255 characters."),
  synopsis: z.string().trim().min(1, "Synopsis is required."),
  contentClassificationId: z.string().min(1, "Classification is required."),
  genreIds: z.array(z.string()).min(1, "At least one genre is required."),
  active: z.boolean(),
});

type SeriesFormValues = z.infer<typeof seriesSchema>;

export interface SeriesCreateUpdateValues {
  name: string;
  synopsis: string;
  contentClassificationId: string;
  genreIds: string[];
  active: boolean;
  photo: PhotoUploadValue;
}

interface SeriesCreateUpdateFormProps {
  mode: "create" | "update";
  initialValues?: {
    name?: string;
    synopsis?: string;
    contentClassificationId?: string;
    genreIds?: string[];
    active?: boolean;
    banner?: Media | null;
  };
  onSubmit: (values: SeriesCreateUpdateValues) => Promise<void> | void;
  isSubmitting?: boolean;
  submitError?: string | null;
  cancelHref?: string;
}

export function SeriesCreateUpdateForm({
  mode,
  initialValues,
  onSubmit,
  isSubmitting = false,
  submitError,
  cancelHref = "/series",
}: SeriesCreateUpdateFormProps) {
  const nameId = useId();
  const synopsisId = useId();
  const classificationId = useId();
  const activeId = useId();
  const [localError, setLocalError] = useState<string | null>(null);
  const [genrePopoverOpen, setGenrePopoverOpen] = useState(false);

  const genresQuery = useGenresList();
  const classificationsQuery = useContentClassificationsList();

  const defaultPhotoUrl = initialValues?.banner
    ? getMediaImageUrl(initialValues.banner.purpose, initialValues.banner.key)
    : null;
  const [photoValue, setPhotoValue] = useState<PhotoUploadValue>(
    createDefaultPhotoValue(defaultPhotoUrl),
  );

  const form = useForm<SeriesFormValues>({
    resolver: zodResolver(seriesSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      synopsis: initialValues?.synopsis ?? "",
      contentClassificationId: initialValues?.contentClassificationId ?? "",
      genreIds: initialValues?.genreIds ?? [],
      active: initialValues?.active ?? true,
    },
  });
  const genreIdsDependency = initialValues?.genreIds?.join(",") ?? "";

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    form.reset({
      name: initialValues?.name ?? "",
      synopsis: initialValues?.synopsis ?? "",
      contentClassificationId: initialValues?.contentClassificationId ?? "",
      genreIds: initialValues?.genreIds ?? [],
      active: initialValues?.active ?? true,
    });
  }, [
    form,
    initialValues?.name,
    initialValues?.synopsis,
    initialValues?.contentClassificationId,
    genreIdsDependency,
    initialValues?.active,
  ]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const isBusy = isSubmitting || form.formState.isSubmitting;
  const errorMessage = localError ?? submitError ?? null;
  const submitLabel = mode === "create" ? "Create series" : "Save changes";

  const genres = genresQuery.data?.filter((g) => g.active) ?? [];
  const classifications =
    classificationsQuery.data?.filter((c) => c.active) ?? [];

  const handleSubmit = form.handleSubmit(async (values) => {
    setLocalError(null);
    try {
      await onSubmit({
        ...values,
        photo: photoValue,
      });
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : "Failed to save series.",
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
            <Field>
              <FieldLabel htmlFor={nameId}>Name</FieldLabel>
              <Input
                id={nameId}
                placeholder="e.g. Attack on Titan, Demon Slayer"
                disabled={isBusy}
                aria-invalid={!!form.formState.errors.name}
                {...form.register("name")}
              />
              <FieldError errors={[form.formState.errors.name]} />
            </Field>

            <Field>
              <FieldLabel htmlFor={synopsisId}>Synopsis</FieldLabel>
              <Textarea
                id={synopsisId}
                placeholder="Write a brief summary of the series..."
                disabled={isBusy}
                className="min-h-32"
                aria-invalid={!!form.formState.errors.synopsis}
                {...form.register("synopsis")}
              />
              <FieldError errors={[form.formState.errors.synopsis]} />
            </Field>
          </FieldGroup>
        </FormSection>
        <FormSection title="Banner" className="min-w-min" separator={false}>
          <FieldGroup>
            <PhotoUploadField
              value={photoValue}
              onChange={setPhotoValue}
              label="Series banner"
              description="Upload a banner image for this series."
              disabled={isBusy}
            />
          </FieldGroup>
        </FormSection>
      </FormSectionGroup>
      <FormSectionGroup>
        <FormSection title="Categorization" separator={false}>
          <Grid>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor={classificationId}>
                  Classification
                </FieldLabel>
                <Controller
                  control={form.control}
                  name="contentClassificationId"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isBusy || classificationsQuery.isLoading}
                    >
                      <SelectTrigger
                        id={classificationId}
                        className="w-full"
                        aria-invalid={
                          !!form.formState.errors.contentClassificationId
                        }
                      >
                        <SelectValue
                          placeholder={
                            classificationsQuery.isLoading
                              ? "Loading..."
                              : "Select a classification"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {classifications.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError
                  errors={[form.formState.errors.contentClassificationId]}
                />
              </Field>

              <Controller
                control={form.control}
                name="genreIds"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Genres</FieldLabel>
                    <Popover
                      open={genrePopoverOpen}
                      onOpenChange={setGenrePopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          role="combobox"
                          aria-expanded={genrePopoverOpen}
                          aria-invalid={!!form.formState.errors.genreIds}
                          disabled={isBusy || genresQuery.isLoading}
                          className={cn(
                            "h-auto min-h-9 w-full justify-between font-normal",
                            !field.value.length && "text-muted-foreground",
                          )}
                        >
                          {genresQuery.isLoading ? (
                            "Loading..."
                          ) : field.value.length > 0 ? (
                            <span className="flex flex-wrap gap-1">
                              {field.value.map((id) => {
                                const genre = genres.find((g) => g.id === id);
                                return (
                                  <Badge
                                    key={id}
                                    variant="secondary"
                                    className="font-normal"
                                  >
                                    {genre?.name ?? id}
                                    <button
                                      type="button"
                                      className="ml-1 rounded-full outline-none hover:text-foreground"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        field.onChange(
                                          field.value.filter((v) => v !== id),
                                        );
                                      }}
                                    >
                                      <X className="size-3" />
                                    </button>
                                  </Badge>
                                );
                              })}
                            </span>
                          ) : (
                            "Select genres..."
                          )}
                          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="Search genres..." />
                          <CommandList>
                            <CommandEmpty>No genres found.</CommandEmpty>
                            <CommandGroup>
                              {genres.map((genre) => {
                                const isSelected = field.value.includes(
                                  genre.id,
                                );
                                return (
                                  <CommandItem
                                    key={genre.id}
                                    value={genre.name}
                                    onSelect={() => {
                                      if (isSelected) {
                                        field.onChange(
                                          field.value.filter(
                                            (v) => v !== genre.id,
                                          ),
                                        );
                                      } else {
                                        field.onChange([
                                          ...field.value,
                                          genre.id,
                                        ]);
                                      }
                                    }}
                                  >
                                    <div
                                      className={cn(
                                        "flex size-4 items-center justify-center rounded-sm border",
                                        isSelected
                                          ? "border-primary bg-primary text-primary-foreground"
                                          : "border-muted-foreground/30",
                                      )}
                                    >
                                      {isSelected && (
                                        <Check className="size-3" />
                                      )}
                                    </div>
                                    {genre.name}
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FieldError errors={[form.formState.errors.genreIds]} />
                  </Field>
                )}
              />
            </FieldGroup>
          </Grid>
        </FormSection>
        <FormSection title="Visibility" separator={false}>
          <Grid>
            <div className="flex gap-8 items-center">
              <div className="space-y-0.5">
                <FieldLabel htmlFor={activeId}>Active</FieldLabel>
                <FieldDescription>
                  Controls whether this series is visible to users.
                </FieldDescription>
              </div>
              <Controller
                control={form.control}
                name="active"
                render={({ field }) => (
                  <Switch
                    id={activeId}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isBusy}
                  />
                )}
              />
            </div>
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
