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
import { GenreCreateUpdateForm } from "@/features/genres/components/genre-create-update-form";
import {
  type CreateGenreInput,
} from "@/features/genres/api";
import { useCreateGenre } from "@/features/genres/hooks";

export default function CreateGenrePage() {
  const router = useRouter();
  const createGenreMutation = useCreateGenre();

  async function handleSubmit(values: CreateGenreInput & { active: boolean }) {
    await createGenreMutation.mutateAsync({ name: values.name });
    router.push("/genres");
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
                <BreadcrumbLink href="/genres">Genres</BreadcrumbLink>
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
          <h1 className="text-2xl font-semibold tracking-tight">Create Genre</h1>
          <p className="text-sm text-muted-foreground">
            Add a new genre to your catalog.
          </p>
        </div>

        <GenreCreateUpdateForm
          mode="create"
          initialValues={{ name: "", active: true }}
          onSubmit={handleSubmit}
          isSubmitting={createGenreMutation.isPending}
          submitError={
            createGenreMutation.error instanceof Error
              ? createGenreMutation.error.message
              : null
          }
          cancelHref="/genres"
        />
      </div>
    </>
  );
}
