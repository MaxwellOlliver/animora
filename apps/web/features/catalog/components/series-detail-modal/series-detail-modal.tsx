"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dialog as DialogPrimitive } from "@base-ui-components/react/dialog";
import { useEffect, useState } from "react";
import {
  BookmarkIcon,
  PlayIcon,
  Volume2Icon,
  VolumeOffIcon,
  XIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { buildMediaUrl, buildHlsUrl } from "@/utils/media-utils";
import { buildFetchSeriesQueryOptions } from "../../queries/fetch-series";
import { buildFetchSeriesPlaylistsQueryOptions } from "../../queries/fetch-series-playlists";
import { buildFetchSeriesTrailersQueryOptions } from "../../queries/fetch-series-trailers";
import { buildFetchFeaturedTrailerQueryOptions } from "../../queries/fetch-featured-trailer";
import { TrailerPlayer } from "../trailer-player";
import { StarRating } from "./star-rating";
import { SeriesDescription } from "./series-description";
import { EpisodesSection } from "./episodes-section";
import { TrailersSection } from "./trailers-section";
import { ReviewsSection } from "./reviews-section";
import { SeriesDetailSkeleton } from "./series-detail-skeleton";

function formatCount(n: number): string {
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

interface SeriesDetailContentProps {
  seriesId: string;
}

export function SeriesDetailContent({ seriesId }: SeriesDetailContentProps) {
  const [muted, setMuted] = useState(true);

  const { data: series, isLoading: isSeriesLoading } = useQuery(
    buildFetchSeriesQueryOptions(seriesId),
  );

  const { data: playlists, isLoading: isPlaylistsLoading } = useQuery(
    buildFetchSeriesPlaylistsQueryOptions(seriesId),
  );

  const { data: trailers, isLoading: isTrailersLoading } = useQuery(
    buildFetchSeriesTrailersQueryOptions(seriesId),
  );

  const { data: featuredTrailer, isLoading: isFeaturedTrailerLoading } =
    useQuery(buildFetchFeaturedTrailerQueryOptions(seriesId));

  const isLoading =
    isSeriesLoading ||
    isPlaylistsLoading ||
    isTrailersLoading ||
    isFeaturedTrailerLoading;

  const featuredTrailerSrc =
    featuredTrailer?.video?.status === "ready" &&
    featuredTrailer.video.masterPlaylistKey
      ? buildHlsUrl(featuredTrailer.video.masterPlaylistKey)
      : null;

  const banner = series?.assets.find((a) => a.purpose === "banner");
  const logo = series?.assets.find((a) => a.purpose === "logo");
  const bannerUrl = banner
    ? buildMediaUrl(banner.media.purpose, banner.media.key)
    : undefined;

  const studios = playlists
    ? [
        ...new Set(
          playlists.map((p) => p.studio).filter((s): s is string => !!s),
        ),
      ]
    : [];

  if (isLoading) {
    return <SeriesDetailSkeleton />;
  }

  return (
    <div className="relative w-full max-w-4xl rounded-xl bg-card shadow-2xl">
      <div className="relative">
        <div className="aspect-video w-full overflow-clip rounded-t-xl">
          <TrailerPlayer
            src={featuredTrailerSrc}
            banner={bannerUrl}
            alt={series?.name ?? ""}
            muted={muted}
            onMutedChange={setMuted}
          />
        </div>
        <div className="pointer-events-none aspect-video absolute inset-0 rounded-t-xl bg-linear-to-t from-card from-0% via-card/80 via-35% to-transparent to-100%" />
        <div className="absolute top-3 right-12 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full bg-black/60 hover:bg-black/80"
            onClick={() => setMuted(!muted)}
          >
            {muted ? (
              <VolumeOffIcon className="size-4" />
            ) : (
              <Volume2Icon className="size-4" />
            )}
          </Button>
        </div>
        <div className="relative z-10 -mt-64 flex flex-col gap-4 px-6 pb-6">
          {logo && (
            <Image
              src={buildMediaUrl(logo.media.purpose, logo.media.key)}
              alt={series?.name ?? ""}
              width={240}
              height={120}
              className="h-24 w-auto object-contain object-left drop-shadow-lg"
              unoptimized
            />
          )}

          <StarRating
            rating={series?.rating.average ?? 0}
            count={formatCount(series?.rating.count ?? 0)}
          />
          <div className="flex items-center gap-3">
            <Button variant="primary" className="gap-2 px-6">
              <PlayIcon className="size-4" />
              Continue watching
            </Button>
            <Button variant="pale" size="icon-md">
              <BookmarkIcon className="size-4" />
            </Button>
          </div>

          {series && (
            <SeriesDescription
              description={series.synopsis}
              studios={studios}
              genres={series.genres.map((g) => g.name)}
              contentClassification={series.contentClassification}
            />
          )}
        </div>
      </div>
      <div className="flex flex-col gap-6 px-6 pb-6">
        <EpisodesSection playlists={playlists ?? []} />
        <TrailersSection trailers={trailers ?? []} />
        <ReviewsSection seriesId={seriesId} />
      </div>
    </div>
  );
}

interface SeriesDetailModalProps {
  seriesId: string;
  open: boolean;
}

export function SeriesDetailModal({ seriesId, open }: SeriesDetailModalProps) {
  const router = useRouter();

  useEffect(() => {
    if (!open) return;

    const body = document.body;
    const wasAlreadyLocked = body.classList.contains("overflow-hidden");

    if (!wasAlreadyLocked) {
      body.classList.add("overflow-hidden");
    }

    return () => {
      if (!wasAlreadyLocked) {
        body.classList.remove("overflow-hidden");
      }
    };
  }, [open]);

  function handleClose() {
    router.back();
  }

  return (
    <DialogPrimitive.Root
      open={open}
      modal="trap-focus"
      onOpenChange={(v) => !v && handleClose()}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 fixed inset-0 z-50 bg-black/70 backdrop-blur-sm duration-200" />

        <DialogPrimitive.Popup
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto pt-8 pb-8 outline-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="relative">
            <div className="absolute top-3 right-3 z-20">
              <DialogPrimitive.Close
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-full bg-black/60 hover:bg-black/80"
                  />
                }
              >
                <XIcon className="size-4" />
              </DialogPrimitive.Close>
            </div>
            <SeriesDetailContent seriesId={seriesId} />
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
