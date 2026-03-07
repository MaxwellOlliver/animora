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
import { Video } from "lucide-react";
import { useParams } from "next/navigation";
import { useEpisodeById } from "@/features/episodes/hooks";

export default function EpisodeVideoPage() {
  const params = useParams<{ id: string }>();
  const episodeId = params.id;
  const episodeQuery = useEpisodeById(episodeId);

  const episodeName = episodeQuery.data?.title ?? null;

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
                <BreadcrumbPage>
                  {episodeName ? `Video: ${episodeName}` : "Video"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {episodeName ? (
              <>
                Manage Video{" "}
                <span className="text-muted-foreground">&mdash;</span>{" "}
                <span className="text-primary/80">{episodeName}</span>
              </>
            ) : episodeQuery.isLoading ? (
              <span className="inline-flex items-center gap-3">
                Manage Video{" "}
                <Skeleton className="inline-block h-6 w-40 align-middle" />
              </span>
            ) : (
              "Manage Video"
            )}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload and manage the video file for this episode.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-20">
          <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
            <Video className="size-5 text-muted-foreground" aria-hidden="true" />
          </div>
          <p className="text-sm font-medium">Video management coming soon</p>
          <p className="text-sm text-muted-foreground">
            Upload, encoding status, and playback preview will be available
            here.
          </p>
        </div>
      </div>
    </>
  );
}
