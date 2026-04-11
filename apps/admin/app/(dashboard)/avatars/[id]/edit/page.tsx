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
import {
  AvatarCreateUpdateForm,
  type AvatarCreateUpdateValues,
} from "@/features/avatars/components/avatar-create-update-form";
import {
  useAvatarById,
  useUpdateAvatar,
  useUploadAvatarPicture,
} from "@/features/avatars/hooks";

export default function EditAvatarPage() {
  const params = useParams<{ id: string }>();
  const avatarId = params.id;
  const router = useRouter();

  const avatarQuery = useAvatarById(avatarId);
  const updateMutation = useUpdateAvatar(avatarId);
  const uploadPictureMutation = useUploadAvatarPicture(avatarId);

  async function handleSubmit(values: AvatarCreateUpdateValues) {
    await updateMutation.mutateAsync({
      name: values.name,
      active: values.active,
      default: values.default,
    });

    if (values.photo.kind === "new") {
      await uploadPictureMutation.mutateAsync(values.photo.file);
    }

    router.push("/avatars");
    router.refresh();
  }

  const avatarName = avatarQuery.data?.name ?? null;

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
                <BreadcrumbLink href="/avatars">Avatars</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {avatarName ? `Edit: ${avatarName}` : "Edit"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {avatarName ? (
              <>
                Edit <span className="text-muted-foreground">&mdash;</span>{" "}
                <span className="text-primary/80">{avatarName}</span>
              </>
            ) : avatarQuery.isLoading ? (
              <span className="inline-flex items-center gap-3">
                Edit{" "}
                <Skeleton className="inline-block h-6 w-40 align-middle" />
              </span>
            ) : (
              "Edit Avatar"
            )}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update avatar details and picture.
          </p>
        </div>

        {avatarQuery.isLoading ? (
          <div className="space-y-6">
            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
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
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            </div>
          </div>
        ) : avatarQuery.isError ? (
          <div
            role="alert"
            aria-live="polite"
            className="max-w-xl rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {avatarQuery.error instanceof Error
              ? avatarQuery.error.message
              : "Failed to load avatar."}
          </div>
        ) : avatarQuery.data ? (
          <AvatarCreateUpdateForm
            mode="update"
            initialValues={{
              name: avatarQuery.data.name,
              active: avatarQuery.data.active,
              default: avatarQuery.data.default,
              picture: avatarQuery.data.picture,
            }}
            onSubmit={handleSubmit}
            isSubmitting={
              updateMutation.isPending || uploadPictureMutation.isPending
            }
            submitError={
              updateMutation.error instanceof Error
                ? updateMutation.error.message
                : uploadPictureMutation.error instanceof Error
                  ? uploadPictureMutation.error.message
                  : null
            }
          />
        ) : (
          <div className="text-sm text-muted-foreground">
            Avatar not found.
          </div>
        )}
      </div>
    </>
  );
}
