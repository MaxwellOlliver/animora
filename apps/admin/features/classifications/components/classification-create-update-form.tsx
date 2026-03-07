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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FormSection } from "@/components/form-section";
import { Grid } from "@/components/grid";
import { getMediaImageUrl } from "@/lib/s3";
import type { Media } from "../types";
import { FormSectionGroup } from "@/components/form-section-group";

const classificationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(50, "Name must be at most 50 characters."),
  description: z.string(),
  active: z.boolean(),
});

type ClassificationFormValues = z.infer<typeof classificationSchema>;

export interface ClassificationCreateUpdateValues {
  name: string;
  description?: string;
  active: boolean;
  photo: PhotoUploadValue;
}

interface ClassificationCreateUpdateFormProps {
  mode: "create" | "update";
  initialValues?: {
    name?: string;
    description?: string | null;
    active?: boolean;
    icon?: Media | null;
  };
  onSubmit: (values: ClassificationCreateUpdateValues) => Promise<void> | void;
  isSubmitting?: boolean;
  submitError?: string | null;
  cancelHref?: string;
}

export function ClassificationCreateUpdateForm({
  mode,
  initialValues,
  onSubmit,
  isSubmitting = false,
  submitError,
  cancelHref = "/classifications",
}: ClassificationCreateUpdateFormProps) {
  const nameId = useId();
  const descriptionId = useId();
  const activeId = useId();
  const [localError, setLocalError] = useState<string | null>(null);

  const defaultPhotoUrl = initialValues?.icon
    ? getMediaImageUrl(initialValues.icon.purpose, initialValues.icon.key)
    : null;
  const [photoValue, setPhotoValue] = useState<PhotoUploadValue>(
    createDefaultPhotoValue(defaultPhotoUrl),
  );

  const form = useForm<ClassificationFormValues>({
    resolver: zodResolver(classificationSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      active: initialValues?.active ?? true,
    },
  });

  useEffect(() => {
    form.reset({
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      active: initialValues?.active ?? true,
    });
  }, [
    form,
    initialValues?.name,
    initialValues?.description,
    initialValues?.active,
  ]);

  const isBusy = isSubmitting || form.formState.isSubmitting;
  const errorMessage = localError ?? submitError ?? null;
  const submitLabel =
    mode === "create" ? "Create classification" : "Save changes";

  const handleSubmit = form.handleSubmit(async (values) => {
    setLocalError(null);
    const normalizedDescription = values.description.trim();

    try {
      await onSubmit({
        name: values.name,
        description: normalizedDescription || undefined,
        active: values.active,
        photo: photoValue,
      });
    } catch (error) {
      setLocalError(
        error instanceof Error
          ? error.message
          : "Failed to save classification.",
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
                placeholder="e.g. PG-13, R, TV-MA"
                disabled={isBusy}
                aria-invalid={!!form.formState.errors.name}
                {...form.register("name")}
              />
              <FieldError errors={[form.formState.errors.name]} />
            </Field>

            <Field>
              <FieldLabel htmlFor={descriptionId}>Description</FieldLabel>
              <Textarea
                id={descriptionId}
                placeholder="Describe what this classification means..."
                disabled={isBusy}
                {...form.register("description")}
              />
              <FieldError errors={[form.formState.errors.description]} />
            </Field>
          </FieldGroup>
        </FormSection>
        <FormSection title="Icon" separator={false}>
          <Grid>
            <FieldGroup>
              <PhotoUploadField
                value={photoValue}
                onChange={setPhotoValue}
                label="Classification icon"
                description="Choose an icon image for this classification."
                disabled={isBusy}
              />
            </FieldGroup>
          </Grid>
        </FormSection>
      </FormSectionGroup>
      <FormSection title="Visibility">
        <Grid>
          <div className="flex gap-8 items-center">
            <div className="space-y-0.5">
              <FieldLabel htmlFor={activeId}>Active</FieldLabel>
              <FieldDescription>
                Controls whether this classification is visible and available
                for use.
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
