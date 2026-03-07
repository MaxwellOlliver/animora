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

  const genreName = genreQuery.data?.name;

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
                <BreadcrumbPage>
                  {genreName ? `Edit: ${genreName}` : "Edit"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {genreName ? (
              <>
                Edit - <span className="text-primary/80">{genreName}</span>
              </>
            ) : genreQuery.isLoading ? (
              <span className="inline-flex items-center gap-3">
                Edit <Skeleton className="inline-block h-6 w-32 align-middle" />
              </span>
            ) : (
              "Edit Genre"
            )}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update genre details and availability.
          </p>
        </div>

        {genreQuery.isLoading ? (
          <div className="max-w-xl overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="px-5 py-4 md:px-6">
              <Skeleton className="h-4 w-16" />
            </div>
            <Separator />
            <div className="space-y-5 px-5 py-5 md:px-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
            <Separator />
            <div className="px-5 py-4 md:px-6">
              <Skeleton className="h-4 w-20" />
            </div>
            <Separator />
            <div className="flex items-center justify-between px-5 py-5 md:px-6">
              <div className="space-y-1">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-5 w-8 rounded-full" />
            </div>
            <Separator />
            <div className="flex items-center justify-between bg-muted/30 px-5 py-4 md:px-6">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ) : genreQuery.isError ? (
          <div
            role="alert"
            aria-live="polite"
            className="max-w-xl rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
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
