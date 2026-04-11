"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { FormSection } from "@/components/form-section";
import { FormSectionGroup } from "@/components/form-section-group";
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
import { Switch } from "@/components/ui/switch";
import { getMediaImageUrl } from "@/lib/s3";

import type { Media } from "../types";

const avatarSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(255, "Name must be at most 255 characters."),
  active: z.boolean(),
  default: z.boolean(),
});

type AvatarFormValues = z.infer<typeof avatarSchema>;

export interface AvatarCreateUpdateValues {
  name: string;
  active: boolean;
  default: boolean;
  photo: PhotoUploadValue;
}

interface AvatarCreateUpdateFormProps {
  mode: "create" | "update";
  initialValues?: {
    name?: string;
    active?: boolean;
    default?: boolean;
    picture?: Media | null;
  };
  onSubmit: (values: AvatarCreateUpdateValues) => Promise<void> | void;
  isSubmitting?: boolean;
  submitError?: string | null;
  cancelHref?: string;
}

export function AvatarCreateUpdateForm({
  mode,
  initialValues,
  onSubmit,
  isSubmitting = false,
  submitError,
  cancelHref = "/avatars",
}: AvatarCreateUpdateFormProps) {
  const nameId = useId();
  const activeId = useId();
  const defaultId = useId();
  const [localError, setLocalError] = useState<string | null>(null);

  const defaultPhotoUrl = initialValues?.picture
    ? getMediaImageUrl(
        initialValues.picture.purpose,
        initialValues.picture.key,
      )
    : null;
  const [photoValue, setPhotoValue] = useState<PhotoUploadValue>(
    createDefaultPhotoValue(defaultPhotoUrl),
  );

  const form = useForm<AvatarFormValues>({
    resolver: zodResolver(avatarSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      active: initialValues?.active ?? true,
      default: initialValues?.default ?? false,
    },
  });

  useEffect(() => {
    form.reset({
      name: initialValues?.name ?? "",
      active: initialValues?.active ?? true,
      default: initialValues?.default ?? false,
    });
  }, [form, initialValues?.name, initialValues?.active, initialValues?.default]);

  const isBusy = isSubmitting || form.formState.isSubmitting;
  const errorMessage = localError ?? submitError ?? null;
  const submitLabel = mode === "create" ? "Create avatar" : "Save changes";

  const handleSubmit = form.handleSubmit(async (values) => {
    setLocalError(null);

    try {
      await onSubmit({
        name: values.name,
        active: values.active,
        default: values.default,
        photo: photoValue,
      });
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : "Failed to save avatar.",
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
                placeholder="e.g. Happy Cat"
                disabled={isBusy}
                aria-invalid={!!form.formState.errors.name}
                {...form.register("name")}
              />
              <FieldError errors={[form.formState.errors.name]} />
            </Field>

            <div className="flex gap-8">
              <Field>
                <div className="flex items-center gap-3">
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
                  <FieldLabel htmlFor={activeId}>Active</FieldLabel>
                </div>
              </Field>

              <Field>
                <div className="flex items-center gap-3">
                  <Controller
                    control={form.control}
                    name="default"
                    render={({ field }) => (
                      <Switch
                        id={defaultId}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isBusy}
                      />
                    )}
                  />
                  <FieldLabel htmlFor={defaultId}>Default</FieldLabel>
                </div>
              </Field>
            </div>
          </FieldGroup>
        </FormSection>
        <FormSection title="Picture" className="min-w-min" separator={false}>
          <FieldGroup>
            <PhotoUploadField
              value={photoValue}
              onChange={setPhotoValue}
              label="Avatar picture"
              description="Upload a picture for this avatar."
              disabled={isBusy}
            />
          </FieldGroup>
        </FormSection>
      </FormSectionGroup>
      <div className="mt-8 flex gap-4">
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
