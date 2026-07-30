"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { FormSection } from "@/components/form-section";
import { Grid } from "@/components/grid";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import type { TimestampSegmentInput } from "../api";
import type { EpisodeTimestamp, EpisodeTimestampType } from "../types";

const TIMESTAMP_TYPES: { type: EpisodeTimestampType; label: string }[] = [
  { type: "recap", label: "Recap" },
  { type: "opening", label: "Opening" },
  { type: "ending", label: "Ending" },
];

type SegmentFormValue = { startSeconds: number | null; endSeconds: number | null };
type TimestampsFormValues = Record<EpisodeTimestampType, SegmentFormValue>;

function toFormValues(timestamps: EpisodeTimestamp[]): TimestampsFormValues {
  const values = {} as TimestampsFormValues;
  for (const { type } of TIMESTAMP_TYPES) {
    values[type] = { startSeconds: null, endSeconds: null };
  }
  for (const timestamp of timestamps) {
    values[timestamp.type] = {
      startSeconds: timestamp.startSeconds,
      endSeconds: timestamp.endSeconds,
    };
  }
  return values;
}

interface EpisodeTimestampsFormProps {
  timestamps: EpisodeTimestamp[];
  onSubmit: (segments: TimestampSegmentInput[]) => Promise<void> | void;
  isSubmitting?: boolean;
}

export function EpisodeTimestampsForm({
  timestamps,
  onSubmit,
  isSubmitting = false,
}: EpisodeTimestampsFormProps) {
  const [localError, setLocalError] = useState<string | null>(null);

  const form = useForm<TimestampsFormValues>({
    defaultValues: toFormValues(timestamps),
  });

  useEffect(() => {
    form.reset(toFormValues(timestamps));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timestamps]);

  const isBusy = isSubmitting || form.formState.isSubmitting;

  const handleSubmit = form.handleSubmit(async (values) => {
    setLocalError(null);

    const segments: TimestampSegmentInput[] = [];

    for (const { type, label } of TIMESTAMP_TYPES) {
      const { startSeconds, endSeconds } = values[type];
      const hasStart = startSeconds !== null;
      const hasEnd = endSeconds !== null;

      if (!hasStart && !hasEnd) continue;

      if (!hasStart || !hasEnd) {
        setLocalError(`${label}: both start and end are required.`);
        return;
      }

      if (endSeconds <= startSeconds) {
        setLocalError(`${label}: end time must be after start time.`);
        return;
      }

      segments.push({ type, startSeconds, endSeconds });
    }

    try {
      await onSubmit(segments);
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : "Failed to save timestamps.",
      );
    }
  });

  return (
    <form onSubmit={handleSubmit}>
      {localError && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-4 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{localError}</span>
        </div>
      )}
      <FormSection title="Timestamps" separator={false}>
        <p className="-mt-2 text-sm text-muted-foreground">
          Mark skippable segments in seconds. Leave both fields empty to omit
          a segment.
        </p>
        <FieldGroup>
          {TIMESTAMP_TYPES.map(({ type, label }) => (
            <Grid key={type}>
              <Field>
                <FieldLabel htmlFor={`${type}-start`}>
                  {label} start (seconds)
                </FieldLabel>
                <Input
                  id={`${type}-start`}
                  type="number"
                  min={0}
                  placeholder="e.g. 30"
                  disabled={isBusy}
                  {...form.register(`${type}.startSeconds`, {
                    setValueAs: (v: string | number | null) =>
                      v === "" || v === null || v === undefined ? null : Number(v),
                  })}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`${type}-end`}>
                  {label} end (seconds)
                </FieldLabel>
                <Input
                  id={`${type}-end`}
                  type="number"
                  min={0}
                  placeholder="e.g. 118"
                  disabled={isBusy}
                  {...form.register(`${type}.endSeconds`, {
                    setValueAs: (v: string | number | null) =>
                      v === "" || v === null || v === undefined ? null : Number(v),
                  })}
                />
              </Field>
            </Grid>
          ))}
        </FieldGroup>
      </FormSection>
      <div className="mt-6 flex gap-4">
        <Button type="submit" size="sm" disabled={isBusy}>
          {isBusy ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              Saving...
            </>
          ) : (
            "Save timestamps"
          )}
        </Button>
      </div>
    </form>
  );
}
