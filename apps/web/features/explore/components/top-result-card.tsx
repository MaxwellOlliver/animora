"use client";

import { useQuery } from "@tanstack/react-query";
import { StarIcon, Volume2Icon, VolumeOffIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { TrailerPlayer } from "@/features/catalog/components/trailer-player";
import { buildFetchFeaturedTrailerQueryOptions } from "@/features/catalog/queries/fetch-featured-trailer";
import { buildHlsUrl, buildMediaUrl } from "@/utils/media-utils";

import type { ExploreSeries } from "../queries/fetch-explore";

const STATUS_LABEL: Record<string, string> = {
  airing: "Airing",
  upcoming: "Upcoming",
  finished: "Finished",
};

const HOVER_DELAY_MS = 300;

interface TopResultCardProps {
  series: ExploreSeries;
  rank: number;
}

export function TopResultCard({ series, rank }: TopResultCardProps) {
  const [muted, setMuted] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const hoverTimeoutRef = useRef<number | null>(null);

  const scheduleHoverStart = useCallback(() => {
    if (hoverTimeoutRef.current !== null) return;
    hoverTimeoutRef.current = window.setTimeout(() => {
      setIsHovering(true);
      hoverTimeoutRef.current = null;
    }, HOVER_DELAY_MS);
  }, []);

  const cancelHover = useCallback(() => {
    if (hoverTimeoutRef.current !== null) {
      window.clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovering(false);
  }, []);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current !== null) {
        window.clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const { data: featuredTrailer } = useQuery({
    ...buildFetchFeaturedTrailerQueryOptions(series.id),
    enabled: isHovering,
  });

  const featuredTrailerSrc =
    featuredTrailer?.video?.status === "ready" &&
    featuredTrailer.video.masterPlaylistKey
      ? buildHlsUrl(featuredTrailer.video.masterPlaylistKey)
      : null;

  const banner = series.assets.find((a) => a.purpose === "banner");
  const poster = series.assets.find((a) => a.purpose === "poster");
  const thumbnail = banner ?? poster;
  const genreNames = series.genres.map((g) => g.name).join(" • ");
  const seriesHref = `/series/${series.id}`;

  return (
    <Link
      href={seriesHref}
      scroll={false}
      onMouseEnter={scheduleHoverStart}
      onMouseLeave={cancelHover}
      className="group outline-none flex items-center gap-4 rounded-xl p-2 transition-colors focus-visible:bg-white/5 hover:bg-white/5"
    >
      <div className="relative aspect-video w-46 shrink-0 overflow-hidden rounded-lg sm:w-72">
        {isHovering ? (
          <TrailerPlayer
            src={featuredTrailerSrc}
            banner={
              thumbnail
                ? buildMediaUrl(thumbnail.media.purpose, thumbnail.media.key)
                : undefined
            }
            alt={series.name}
            muted={muted}
            onMutedChange={setMuted}
          />
        ) : thumbnail ? (
          <Image
            src={buildMediaUrl(thumbnail.media.purpose, thumbnail.media.key)}
            alt={series.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="size-full bg-white/10" />
        )}
        {isHovering && featuredTrailerSrc && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMuted(!muted);
            }}
            className="absolute right-2 bottom-2 z-10 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
          >
            {muted ? (
              <VolumeOffIcon className="size-3.5" />
            ) : (
              <Volume2Icon className="size-3.5" />
            )}
          </button>
        )}
        <span className="absolute left-2 top-2 z-10 flex size-6 items-center justify-center rounded-full bg-black/70 text-xs font-semibold text-white">
          {rank}
        </span>
      </div>

      <div className="flex min-w-0 flex-col justify-center gap-1 py-1">
        {genreNames && (
          <span className="text-xs text-foreground-muted">{genreNames}</span>
        )}
        <h3 className="font-heading text-lg font-semibold leading-6">
          {series.name}
        </h3>
        <p className="line-clamp-2 text-sm leading-5 text-foreground-muted">
          {series.synopsis}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {series.releaseYear && (
            <span className="text-secondary">{series.releaseYear}</span>
          )}
          {series.status && (
            <span className="rounded-full bg-primary/15 px-2 py-0.5 font-medium text-primary">
              {STATUS_LABEL[series.status]}
            </span>
          )}
          {series.contentClassification?.icon && (
            <Image
              src={buildMediaUrl(
                series.contentClassification.icon.purpose,
                series.contentClassification.icon.key,
              )}
              alt={series.contentClassification.name}
              title={series.contentClassification.name}
              width={16}
              height={16}
              className="size-4"
              unoptimized
            />
          )}
          {series.rating.count > 0 && (
            <span className="flex items-center gap-1 font-medium text-warning">
              <StarIcon className="size-3.5 fill-warning" />
              {series.rating.average.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
