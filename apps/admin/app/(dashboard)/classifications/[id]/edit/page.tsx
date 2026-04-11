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
import type { ClassificationCreateUpdateValues } from "@/features/classifications/components/classification-create-update-form";
import { ClassificationCreateUpdateForm } from "@/features/classifications/components/classification-create-update-form";
import {
  useContentClassificationById,
  useUpdateContentClassification,
  useUploadContentClassificationIcon,
} from "@/features/classifications/hooks";

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

  const classificationName = classificationQuery.data?.name;

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
                <BreadcrumbPage>
                  {classificationName
                    ? `Edit: ${classificationName}`
                    : "Edit"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {classificationName ? (
              <>
                Edit <span className="text-muted-foreground">&mdash;</span>{" "}
                <span className="text-primary/80">{classificationName}</span>
              </>
            ) : classificationQuery.isLoading ? (
              <span className="inline-flex items-center gap-3">
                Edit <Skeleton className="inline-block h-6 w-32 align-middle" />
              </span>
            ) : (
              "Edit Classification"
            )}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update classification details and icon.
          </p>
        </div>

        {classificationQuery.isLoading ? (
          <div className="max-w-2xl overflow-hidden rounded-xl border bg-card shadow-sm">
            {/* Icon skeleton */}
            <div className="px-5 py-4 md:px-6">
              <Skeleton className="h-4 w-10" />
            </div>
            <Separator />
            <div className="px-5 py-5 md:px-6">
              <div className="flex items-start gap-4">
                <Skeleton className="size-20 rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-28" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            </div>
            {/* Details skeleton */}
            <Separator />
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
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
            {/* Visibility skeleton */}
            <Separator />
            <div className="px-5 py-4 md:px-6">
              <Skeleton className="h-4 w-20" />
            </div>
            <Separator />
            <div className="flex items-center justify-between px-5 py-5 md:px-6">
              <div className="space-y-1">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-5 w-8 rounded-full" />
            </div>
            {/* Actions skeleton */}
            <Separator />
            <div className="flex items-center justify-between bg-muted/30 px-5 py-4 md:px-6">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ) : classificationQuery.isError ? (
          <div
            role="alert"
            aria-live="polite"
            className="max-w-xl rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
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
              icon: classificationQuery.data.icon,
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
