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
import { useRouter } from "next/navigation";

import {
  PlaylistCreateUpdateForm,
  type PlaylistCreateUpdateValues,
} from "@/features/playlists/components/playlist-create-update-form";
import { useCreatePlaylist } from "@/features/playlists/hooks";
import { uploadPlaylistCover } from "@/features/playlists/api";

export default function CreatePlaylistPage() {
  const router = useRouter();
  const createMutation = useCreatePlaylist();

  async function handleSubmit(values: PlaylistCreateUpdateValues) {
    const created = await createMutation.mutateAsync({
      seriesId: values.seriesId,
      type: values.type,
      number: values.number,
      title: values.title,
    });

    if (values.photo.kind === "new") {
      await uploadPlaylistCover(created.id, values.photo.file);
    }

    router.push("/playlists");
    router.refresh();
  }

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
                <BreadcrumbPage>Create</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Create Playlist
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a new playlist to a series.
          </p>
        </div>

        <PlaylistCreateUpdateForm
          mode="create"
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending}
          submitError={
            createMutation.error instanceof Error
              ? createMutation.error.message
              : null
          }
        />
      </div>
    </>
  );
}
