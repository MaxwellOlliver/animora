"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { FormSection } from "@/components/form-section";
import { Grid } from "@/components/grid";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export const genreCreateUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(100, "Name must be at most 100 characters."),
  active: z.boolean(),
});

export type GenreCreateUpdateValues = z.infer<typeof genreCreateUpdateSchema>;

interface GenreCreateUpdateFormProps {
  mode: "create" | "update";
  initialValues?: Partial<GenreCreateUpdateValues>;
  onSubmit: (values: GenreCreateUpdateValues) => Promise<void> | void;
  isSubmitting?: boolean;
  submitError?: string | null;
  cancelHref?: string;
}

export function GenreCreateUpdateForm({
  mode,
  initialValues,
  onSubmit,
  isSubmitting = false,
  submitError,
  cancelHref = "/genres",
}: GenreCreateUpdateFormProps) {
  const nameId = useId();
  const activeId = useId();
  const [localError, setLocalError] = useState<string | null>(null);

  const form = useForm<GenreCreateUpdateValues>({
    resolver: zodResolver(genreCreateUpdateSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      active: initialValues?.active ?? true,
    },
  });

  useEffect(() => {
    form.reset({
      name: initialValues?.name ?? "",
      active: initialValues?.active ?? true,
    });
  }, [form, initialValues?.name, initialValues?.active]);

  const isBusy = isSubmitting || form.formState.isSubmitting;
  const errorMessage = localError ?? submitError ?? null;

  const submitLabel = mode === "create" ? "Create genre" : "Save changes";

  const handleSubmit = form.handleSubmit(async (values) => {
    setLocalError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : "Failed to save genre.",
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
      <FormSection title="Details">
        <Grid>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={nameId}>Name</FieldLabel>
              <Input
                id={nameId}
                placeholder="e.g. Action, Romance, Sci-Fi"
                disabled={isBusy}
                aria-invalid={!!form.formState.errors.name}
                {...form.register("name")}
              />
              <FieldError errors={[form.formState.errors.name]} />
            </Field>
          </FieldGroup>
        </Grid>
      </FormSection>
      <FormSection title="Visibility">
        <Grid>
          <div className="flex gap-8 items-center">
            <div className="space-y-0.5">
              <FieldLabel htmlFor={activeId}>Active</FieldLabel>
              <FieldDescription>
                Controls whether this genre is visible and available for use.
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
