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
import { GenreCreateUpdateForm } from "@/features/genres/components/genre-create-update-form";
import { useGenreById, useUpdateGenre } from "@/features/genres/hooks";

export default function EditGenrePage() {
  const params = useParams<{ id: string }>();
  const genreId = params.id;
  const router = useRouter();

  const genreQuery = useGenreById(genreId);
  const updateGenreMutation = useUpdateGenre(genreId);

  async function handleSubmit(values: { name: string; active: boolean }) {
    await updateGenreMutation.mutateAsync(values);
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
                <BreadcrumbPage>Edit</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit Genre</h1>
          <p className="text-sm text-muted-foreground">
            Update genre details and availability.
          </p>
        </div>

        {genreQuery.isLoading ? (
          <div className="max-w-xl space-y-4 rounded-lg border p-4 md:p-6">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-36" />
          </div>
        ) : genreQuery.isError ? (
          <div
            role="alert"
            aria-live="polite"
            className="max-w-xl rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {genreQuery.error instanceof Error
              ? genreQuery.error.message
              : "Failed to load genre."}
          </div>
        ) : genreQuery.data ? (
          <GenreCreateUpdateForm
            mode="update"
            initialValues={{
              name: genreQuery.data.name,
              active: genreQuery.data.active,
            }}
            onSubmit={handleSubmit}
            isSubmitting={updateGenreMutation.isPending}
            submitError={
              updateGenreMutation.error instanceof Error
                ? updateGenreMutation.error.message
                : null
            }
            cancelHref="/genres"
          />
        ) : (
          <div className="text-sm text-muted-foreground">Genre not found.</div>
        )}
      </div>
    </>
  );
}
