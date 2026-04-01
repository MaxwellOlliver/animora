"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams, useRouter } from "next/navigation";

import {
  TrailerCreateUpdateForm,
  type TrailerCreateUpdateValues,
} from "@/features/trailers/components/trailer-create-update-form";
import {
  useTrailerById,
  useUpdateTrailer,
  useUploadTrailerThumbnail,
} from "@/features/trailers/hooks";

export default function EditTrailerPage() {
  const params = useParams<{ id: string }>();
  const trailerId = params.id;
  const router = useRouter();

  const trailerQuery = useTrailerById(trailerId);
  const updateMutation = useUpdateTrailer(trailerId);
  const uploadThumbnailMutation = useUploadTrailerThumbnail(trailerId);

  async function handleSubmit(values: TrailerCreateUpdateValues) {
    await updateMutation.mutateAsync({
      playlistId: values.playlistId,
      number: values.number,
      title: values.title,
      durationSeconds: values.durationSeconds,
    });

    if (values.photo.kind === "new") {
      await uploadThumbnailMutation.mutateAsync(values.photo.file);
    }

    router.push("/trailers");
    router.refresh();
  }

  const trailerName = trailerQuery.data?.title ?? null;

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/trailers">Trailers</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {trailerName ? `Edit: ${trailerName}` : "Edit"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {trailerName ? (
              <>
                Edit <span className="text-muted-foreground">&mdash;</span>{" "}
                <span className="text-primary/80">{trailerName}</span>
              </>
            ) : trailerQuery.isLoading ? (
              <span className="inline-flex items-center gap-3">
                Edit{" "}
                <Skeleton className="inline-block h-6 w-40 align-middle" />
              </span>
            ) : (
              "Edit Trailer"
            )}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update trailer details and thumbnail.
          </p>
        </div>

        {trailerQuery.isLoading ? (
          <div className="space-y-6">
            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
              <div className="px-5 py-4 md:px-6">
                <Skeleton className="h-4 w-16" />
              </div>
              <Separator />
              <div className="space-y-5 px-5 py-5 md:px-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-9 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-9 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            </div>
          </div>
        ) : trailerQuery.isError ? (
          <div
            role="alert"
            aria-live="polite"
            className="max-w-xl rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {trailerQuery.error instanceof Error
              ? trailerQuery.error.message
              : "Failed to load trailer."}
          </div>
        ) : trailerQuery.data ? (
          <TrailerCreateUpdateForm
            mode="update"
            initialValues={{
              seriesId: trailerQuery.data.seriesId,
              playlistId: trailerQuery.data.playlistId,
              number: trailerQuery.data.number,
              title: trailerQuery.data.title,
              durationSeconds: trailerQuery.data.durationSeconds,
              thumbnail: trailerQuery.data.thumbnail,
            }}
            onSubmit={handleSubmit}
            isSubmitting={
              updateMutation.isPending || uploadThumbnailMutation.isPending
            }
            submitError={
              updateMutation.error instanceof Error
                ? updateMutation.error.message
                : uploadThumbnailMutation.error instanceof Error
                  ? uploadThumbnailMutation.error.message
                  : null
            }
          />
        ) : (
          <div className="text-sm text-muted-foreground">
            Trailer not found.
          </div>
        )}
      </div>
    </>
  );
}
