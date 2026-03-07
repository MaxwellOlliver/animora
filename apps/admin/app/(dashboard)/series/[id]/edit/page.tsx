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
  SeriesCreateUpdateForm,
  type SeriesCreateUpdateValues,
} from "@/features/series/components/series-create-update-form";
import {
  useSeriesById,
  useUpdateSeries,
  useUploadSeriesBanner,
} from "@/features/series/hooks";

export default function EditSeriesPage() {
  const params = useParams<{ id: string }>();
  const seriesId = params.id;
  const router = useRouter();

  const seriesQuery = useSeriesById(seriesId);
  const updateMutation = useUpdateSeries(seriesId);
  const uploadBannerMutation = useUploadSeriesBanner(seriesId);

  async function handleSubmit(values: SeriesCreateUpdateValues) {
    await updateMutation.mutateAsync({
      name: values.name,
      synopsis: values.synopsis,
      contentClassificationId: values.contentClassificationId,
      genreIds: values.genreIds,
      active: values.active,
    });

    if (values.photo.kind === "new") {
      await uploadBannerMutation.mutateAsync(values.photo.file);
    }

    router.push("/series");
    router.refresh();
  }

  const seriesName = seriesQuery.data?.name;

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
                <BreadcrumbLink href="/series">Series</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {seriesName ? `Edit: ${seriesName}` : "Edit"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {seriesName ? (
              <>
                Edit <span className="text-muted-foreground">&mdash;</span>{" "}
                <span className="text-primary/80">{seriesName}</span>
              </>
            ) : seriesQuery.isLoading ? (
              <span className="inline-flex items-center gap-3">
                Edit{" "}
                <Skeleton className="inline-block h-6 w-40 align-middle" />
              </span>
            ) : (
              "Edit Series"
            )}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update series details, categorization, and banner.
          </p>
        </div>

        {seriesQuery.isLoading ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Main column skeleton */}
            <div className="flex flex-col gap-6">
              {/* Banner skeleton */}
              <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                <div className="px-5 py-4 md:px-6">
                  <Skeleton className="h-4 w-14" />
                </div>
                <Separator />
                <div className="px-5 py-5 md:px-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="size-20 rounded-md" />
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-28" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Details skeleton */}
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
                    <Skeleton className="h-32 w-full" />
                  </div>
                </div>
              </div>
            </div>
            {/* Sidebar column skeleton */}
            <div className="flex flex-col gap-6">
              {/* Categorization skeleton */}
              <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                <div className="px-5 py-4 md:px-6">
                  <Skeleton className="h-4 w-28" />
                </div>
                <Separator />
                <div className="space-y-5 px-5 py-5 md:px-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-14" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                </div>
              </div>
              {/* Visibility skeleton */}
              <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                <div className="px-5 py-4 md:px-6">
                  <Skeleton className="h-4 w-20" />
                </div>
                <Separator />
                <div className="flex items-center justify-between px-5 py-5 md:px-6">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <Skeleton className="h-5 w-8 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ) : seriesQuery.isError ? (
          <div
            role="alert"
            aria-live="polite"
            className="max-w-xl rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {seriesQuery.error instanceof Error
              ? seriesQuery.error.message
              : "Failed to load series."}
          </div>
        ) : seriesQuery.data ? (
          <SeriesCreateUpdateForm
            mode="update"
            initialValues={{
              name: seriesQuery.data.name,
              synopsis: seriesQuery.data.synopsis,
              contentClassificationId:
                seriesQuery.data.contentClassificationId,
              genreIds: seriesQuery.data.genres.map((g) => g.id),
              active: seriesQuery.data.active,
              banner: seriesQuery.data.banner,
            }}
            onSubmit={handleSubmit}
            isSubmitting={
              updateMutation.isPending || uploadBannerMutation.isPending
            }
            submitError={
              updateMutation.error instanceof Error
                ? updateMutation.error.message
                : uploadBannerMutation.error instanceof Error
                  ? uploadBannerMutation.error.message
                  : null
            }
            cancelHref="/series"
          />
        ) : (
          <div className="text-sm text-muted-foreground">
            Series not found.
          </div>
        )}
      </div>
    </>
  );
}
