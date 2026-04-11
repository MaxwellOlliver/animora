"use client";

import { useRouter } from "next/navigation";

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
import { uploadTrailerThumbnail } from "@/features/trailers/api";
import {
  TrailerCreateUpdateForm,
  type TrailerCreateUpdateValues,
} from "@/features/trailers/components/trailer-create-update-form";
import { useCreateTrailer } from "@/features/trailers/hooks";

export default function CreateTrailerPage() {
  const router = useRouter();
  const createMutation = useCreateTrailer();

  async function handleSubmit(values: TrailerCreateUpdateValues) {
    const created = await createMutation.mutateAsync({
      seriesId: values.seriesId,
      playlistId: values.playlistId,
      number: values.number,
      title: values.title,
      durationSeconds: values.durationSeconds,
    });

    if (values.photo.kind === "new") {
      await uploadTrailerThumbnail(created.id, values.photo.file);
    }

    router.push("/trailers");
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
                <BreadcrumbLink href="/trailers">Trailers</BreadcrumbLink>
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
            Create Trailer
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a new trailer to a series.
          </p>
        </div>

        <TrailerCreateUpdateForm
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
