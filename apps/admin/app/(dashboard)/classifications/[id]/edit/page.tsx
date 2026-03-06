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

import { ClassificationCreateUpdateForm } from "@/features/classifications/components/classification-create-update-form";
import {
  useContentClassificationById,
  useUpdateContentClassification,
  useUploadContentClassificationIcon,
} from "@/features/classifications/hooks";
import type { ClassificationCreateUpdateValues } from "@/features/classifications/components/classification-create-update-form";

export default function EditClassificationPage() {
  const params = useParams<{ id: string }>();
  const classificationId = params.id;
  const router = useRouter();

  const classificationQuery = useContentClassificationById(classificationId);
  const updateMutation = useUpdateContentClassification(classificationId);
  const uploadMutation = useUploadContentClassificationIcon(classificationId);

  async function handleSubmit(values: ClassificationCreateUpdateValues) {
    await updateMutation.mutateAsync({
      name: values.name,
      description: values.description,
      active: values.active,
    });

    if (values.photo.kind === "new") {
      await uploadMutation.mutateAsync(values.photo.file);
    }

    router.push("/classifications");
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
                <BreadcrumbLink href="/classifications">
                  Classifications
                </BreadcrumbLink>
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
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit Classification
          </h1>
          <p className="text-sm text-muted-foreground">
            Update classification details and icon.
          </p>
        </div>

        {classificationQuery.isLoading ? (
          <div className="max-w-2xl space-y-4 rounded-lg border p-4 md:p-6">
            <Skeleton className="h-20 w-20 rounded-md" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-36" />
          </div>
        ) : classificationQuery.isError ? (
          <div
            role="alert"
            aria-live="polite"
            className="max-w-xl rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {classificationQuery.error instanceof Error
              ? classificationQuery.error.message
              : "Failed to load classification."}
          </div>
        ) : classificationQuery.data ? (
          <ClassificationCreateUpdateForm
            mode="update"
            initialValues={{
              name: classificationQuery.data.name,
              description: classificationQuery.data.description,
              active: classificationQuery.data.active,
              iconKey: classificationQuery.data.iconKey,
            }}
            onSubmit={handleSubmit}
            isSubmitting={updateMutation.isPending || uploadMutation.isPending}
            submitError={
              updateMutation.error instanceof Error
                ? updateMutation.error.message
                : uploadMutation.error instanceof Error
                  ? uploadMutation.error.message
                  : null
            }
            cancelHref="/classifications"
          />
        ) : (
          <div className="text-sm text-muted-foreground">
            Classification not found.
          </div>
        )}
      </div>
    </>
  );
}
