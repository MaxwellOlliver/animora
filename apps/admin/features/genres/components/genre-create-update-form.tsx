"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
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
    <form className="max-w-xl" onSubmit={handleSubmit}>
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

          <Field>
            <FieldLabel htmlFor={nameId}>Name</FieldLabel>
            <Input
              id={nameId}
              placeholder="Action"
              disabled={isBusy}
              aria-invalid={!!form.formState.errors.name}
              {...form.register("name")}
            />
            <FieldError errors={[form.formState.errors.name]} />
          </Field>

          <Field orientation="horizontal">
            <div className="space-y-0.5">
              <FieldLabel htmlFor={activeId}>Active</FieldLabel>
              <FieldDescription>
                Controls whether this genre is available for use.
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
