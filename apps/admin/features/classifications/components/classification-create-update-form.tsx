"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

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
import { getImageUrl } from "@/lib/s3";

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
    iconKey?: string | null;
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

  const defaultPhotoUrl = initialValues?.iconKey
    ? getImageUrl(initialValues.iconKey)
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
  }, [form, initialValues?.name, initialValues?.description, initialValues?.active]);

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
        error instanceof Error ? error.message : "Failed to save classification.",
      );
    }
  });

  return (
    <form className="max-w-2xl" onSubmit={handleSubmit}>
      <div className="rounded-lg border p-4 md:p-6">
        <FieldGroup>
          {errorMessage && (
            <div
              role="alert"
              aria-live="polite"
              className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {errorMessage}
            </div>
          )}

          <PhotoUploadField
            value={photoValue}
            onChange={setPhotoValue}
            label="Icon"
            description="Choose an icon image for this classification."
            disabled={isBusy}
          />

          <Field>
            <FieldLabel htmlFor={nameId}>Name</FieldLabel>
            <Input
              id={nameId}
              placeholder="+14"
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
              placeholder="Not recommended for children under 14."
              disabled={isBusy}
              {...form.register("description")}
            />
            <FieldError errors={[form.formState.errors.description]} />
          </Field>

          <Field orientation="horizontal">
            <div className="space-y-0.5">
              <FieldLabel htmlFor={activeId}>Active</FieldLabel>
              <FieldDescription>
                Controls whether this classification is available for use.
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
          </Field>

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={isBusy}>
              {isBusy ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" />
                  Saving...
                </>
              ) : (
                submitLabel
              )}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href={cancelHref}>Cancel</Link>
            </Button>
          </div>
        </FieldGroup>
      </div>
    </form>
  );
}
