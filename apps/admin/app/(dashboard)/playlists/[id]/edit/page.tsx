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
  PlaylistCreateUpdateForm,
  type PlaylistCreateUpdateValues,
} from "@/features/playlists/components/playlist-create-update-form";
import {
  usePlaylistById,
  useUpdatePlaylist,
  useUploadPlaylistCover,
} from "@/features/playlists/hooks";
export default function EditPlaylistPage() {
  const params = useParams<{ id: string }>();
  const playlistId = params.id;
  const router = useRouter();

  const playlistQuery = usePlaylistById(playlistId);
  const updateMutation = useUpdatePlaylist(playlistId);
  const uploadCoverMutation = useUploadPlaylistCover(playlistId);

  const cancelHref = "/playlists";

  async function handleSubmit(values: PlaylistCreateUpdateValues) {
    await updateMutation.mutateAsync({
      type: values.type,
      number: values.number,
      title: values.title,
      status: values.status,
      studio: values.studio,
      airStartDate: values.airStartDate,
      airEndDate: values.airEndDate,
    });

    if (values.photo.kind === "new") {
      await uploadCoverMutation.mutateAsync(values.photo.file);
    }

    router.push(cancelHref);
    router.refresh();
  }

  const playlistName = playlistQuery.data
    ? playlistQuery.data.title ??
      `${playlistQuery.data.type === "season" ? "Season" : playlistQuery.data.type === "movie" ? "Movie" : "Special"} ${playlistQuery.data.number}`
    : null;

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
                <BreadcrumbLink href="/playlists">Playlists</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {playlistName ? `Edit: ${playlistName}` : "Edit"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {playlistName ? (
              <>
                Edit <span className="text-muted-foreground">&mdash;</span>{" "}
                <span className="text-primary/80">{playlistName}</span>
              </>
            ) : playlistQuery.isLoading ? (
              <span className="inline-flex items-center gap-3">
                Edit{" "}
                <Skeleton className="inline-block h-6 w-40 align-middle" />
              </span>
            ) : (
              "Edit Playlist"
            )}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update playlist details and cover image.
          </p>
        </div>

        {playlistQuery.isLoading ? (
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
              </div>
            </div>
          </div>
        ) : playlistQuery.isError ? (
          <div
            role="alert"
            aria-live="polite"
            className="max-w-xl rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {playlistQuery.error instanceof Error
              ? playlistQuery.error.message
              : "Failed to load playlist."}
          </div>
        ) : playlistQuery.data ? (
          <PlaylistCreateUpdateForm
            mode="update"
            initialValues={{
              seriesId: playlistQuery.data.seriesId,
              type: playlistQuery.data.type,
              status: playlistQuery.data.status,
              number: playlistQuery.data.number,
              title: playlistQuery.data.title,
              studio: playlistQuery.data.studio,
              airStartDate: playlistQuery.data.airStartDate,
              airEndDate: playlistQuery.data.airEndDate,
              cover: playlistQuery.data.cover,
            }}
            onSubmit={handleSubmit}
            isSubmitting={
              updateMutation.isPending || uploadCoverMutation.isPending
            }
            submitError={
              updateMutation.error instanceof Error
                ? updateMutation.error.message
                : uploadCoverMutation.error instanceof Error
                  ? uploadCoverMutation.error.message
                  : null
            }
            cancelHref={cancelHref}
          />
        ) : (
          <div className="text-sm text-muted-foreground">
            Playlist not found.
          </div>
        )}
      </div>
    </>
  );
}
