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
  SeriesCreateUpdateForm,
  type SeriesCreateUpdateValues,
} from "@/features/series/components/series-create-update-form";
import { useCreateSeries } from "@/features/series/hooks";
import { uploadSeriesBanner } from "@/features/series/api";

export default function CreateSeriesPage() {
  const router = useRouter();
  const createMutation = useCreateSeries();

  async function handleSubmit(values: SeriesCreateUpdateValues) {
    const created = await createMutation.mutateAsync({
      name: values.name,
      synopsis: values.synopsis,
      contentClassificationId: values.contentClassificationId,
      genreIds: values.genreIds,
      active: values.active,
    });

    if (values.photo.kind === "new") {
      await uploadSeriesBanner(created.id, values.photo.file);
    }

    router.push("/series");
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
                <BreadcrumbLink href="/series">Series</BreadcrumbLink>
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
            Create Series
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a new anime series to your catalog.
          </p>
        </div>

        <SeriesCreateUpdateForm
          mode="create"
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending}
          submitError={
            createMutation.error instanceof Error
              ? createMutation.error.message
              : null
          }
          cancelHref="/series"
        />
      </div>
    </>
  );
}
