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
import { useQueryClient } from "@tanstack/react-query";

import { ClassificationCreateUpdateForm } from "@/features/classifications/components/classification-create-update-form";
import {
  createContentClassification,
  updateContentClassification,
  uploadContentClassificationIcon,
} from "@/features/classifications/api";
import type { ClassificationCreateUpdateValues } from "@/features/classifications/components/classification-create-update-form";

export default function CreateClassificationPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  async function handleSubmit(values: ClassificationCreateUpdateValues) {
    const created = await createContentClassification({
      name: values.name,
      description: values.description,
    });

    if (!values.active) {
      await updateContentClassification(created.id, {
        name: values.name,
        description: values.description,
        active: values.active,
      });
    }

    if (values.photo.kind === "new") {
      await uploadContentClassificationIcon(created.id, values.photo.file);
    }

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["content-classifications"] }),
      queryClient.invalidateQueries({
        queryKey: ["content-classifications", created.id],
      }),
    ]);

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
                <BreadcrumbPage>Create</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Create Classification
          </h1>
          <p className="text-sm text-muted-foreground">
            Add a new content classification.
          </p>
        </div>
        <ClassificationCreateUpdateForm
          mode="create"
          initialValues={{ name: "", description: "", active: true, iconKey: null }}
          onSubmit={handleSubmit}
          cancelHref="/classifications"
        />
      </div>
    </>
  );
}
