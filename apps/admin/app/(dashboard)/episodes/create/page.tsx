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
  EpisodeCreateUpdateForm,
  type EpisodeCreateUpdateValues,
} from "@/features/episodes/components/episode-create-update-form";
import { useCreateEpisode } from "@/features/episodes/hooks";
import { uploadEpisodeThumbnail } from "@/features/episodes/api";

export default function CreateEpisodePage() {
  const router = useRouter();
  const createMutation = useCreateEpisode();

  async function handleSubmit(values: EpisodeCreateUpdateValues) {
    const created = await createMutation.mutateAsync({
      playlistId: values.playlistId,
      number: values.number,
      title: values.title,
      description: values.description,
    });

    if (values.photo.kind === "new") {
      await uploadEpisodeThumbnail(created.id, values.photo.file);
    }

    router.push("/episodes");
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
                <BreadcrumbLink href="/episodes">Episodes</BreadcrumbLink>
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
            Create Episode
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a new episode to a playlist.
          </p>
        </div>

        <EpisodeCreateUpdateForm
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
