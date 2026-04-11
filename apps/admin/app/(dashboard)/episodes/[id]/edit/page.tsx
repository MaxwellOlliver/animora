"use client";

import { useParams, useRouter } from "next/navigation";

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
import {
  EpisodeCreateUpdateForm,
  type EpisodeCreateUpdateValues,
} from "@/features/episodes/components/episode-create-update-form";
import {
  useEpisodeById,
  useUpdateEpisode,
  useUploadEpisodeThumbnail,
} from "@/features/episodes/hooks";

export default function EditEpisodePage() {
  const params = useParams<{ id: string }>();
  const episodeId = params.id;
  const router = useRouter();

  const episodeQuery = useEpisodeById(episodeId);
  const updateMutation = useUpdateEpisode(episodeId);
  const uploadThumbnailMutation = useUploadEpisodeThumbnail(episodeId);

  async function handleSubmit(values: EpisodeCreateUpdateValues) {
    await updateMutation.mutateAsync({
      number: values.number,
      title: values.title,
      description: values.description,
      durationSeconds: values.durationSeconds,
    });

    if (values.photo.kind === "new") {
      await uploadThumbnailMutation.mutateAsync(values.photo.file);
    }

    router.push("/episodes");
    router.refresh();
  }

  const episodeName = episodeQuery.data?.title ?? null;

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
                <BreadcrumbLink href="/episodes">Episodes</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {episodeName ? `Edit: ${episodeName}` : "Edit"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {episodeName ? (
              <>
                Edit <span className="text-muted-foreground">&mdash;</span>{" "}
                <span className="text-primary/80">{episodeName}</span>
              </>
            ) : episodeQuery.isLoading ? (
              <span className="inline-flex items-center gap-3">
                Edit{" "}
                <Skeleton className="inline-block h-6 w-40 align-middle" />
              </span>
            ) : (
              "Edit Episode"
            )}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update episode details and thumbnail.
          </p>
        </div>

        {episodeQuery.isLoading ? (
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
                  <Skeleton className="h-24 w-full" />
                </div>
              </div>
            </div>
          </div>
        ) : episodeQuery.isError ? (
          <div
            role="alert"
            aria-live="polite"
            className="max-w-xl rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {episodeQuery.error instanceof Error
              ? episodeQuery.error.message
              : "Failed to load episode."}
          </div>
        ) : episodeQuery.data ? (
          <EpisodeCreateUpdateForm
            mode="update"
            initialValues={{
              playlistId: episodeQuery.data.playlistId,
              number: episodeQuery.data.number,
              title: episodeQuery.data.title,
              description: episodeQuery.data.description,
              durationSeconds: episodeQuery.data.durationSeconds,
              thumbnail: episodeQuery.data.thumbnail,
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
            Episode not found.
          </div>
        )}
      </div>
    </>
  );
}
