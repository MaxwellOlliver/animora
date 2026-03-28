"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  BookmarkIcon,
  InfoIcon,
  PlayIcon,
  Volume2Icon,
  VolumeOffIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardPopover } from "./card-popover";
import { TrailerPlayer } from "./trailer-player";
import type { RecommendedSeries } from "../queries/fetch-recommended";
import { buildMediaUrl } from "@/utils/media-utils";

interface SeriesCardProps {
  series: RecommendedSeries;
}

export function SeriesCard({ series }: SeriesCardProps) {
  const searchParams = useSearchParams();
  const [muted, setMuted] = useState(true);

  const genres = series.genres.map((g) => g.name).join(" • ");
  const poster = series.assets.find((a) => a.purpose === "poster");
  const banner = series.assets.find((a) => a.purpose === "banner");
  const trailer = series.assets.find((a) => a.purpose === "trailer");
  const cardImage = poster ?? banner;

  function buildSeriesHref(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("s", id);
    return `?${params.toString()}`;
  }

  return (
    <CardPopover
      content={
        <div className="flex w-[clamp(280px,23vw,350px)] flex-col">
          <div className="relative aspect-video w-full overflow-clip">
            {trailer ? (
              <>
                <TrailerPlayer
                  src={trailer.media.key}
                  poster={
                    poster
                      ? buildMediaUrl(poster.media.purpose, poster.media.key)
                      : undefined
                  }
                  alt={series.name}
                  muted={muted}
                  onMutedChange={setMuted}
                />
                <button
                  type="button"
                  onClick={() => setMuted(!muted)}
                  className="absolute right-2 bottom-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
                >
                  {muted ? (
                    <VolumeOffIcon className="size-3.5" />
                  ) : (
                    <Volume2Icon className="size-3.5" />
                  )}
                </button>
              </>
            ) : banner ? (
              <Image
                src={buildMediaUrl(banner.media.purpose, banner.media.key)}
                alt={series.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-white/10" />
            )}
          </div>
          <div className="flex flex-col gap-2 p-4">
            <div className="flex flex-col gap-2">
              {genres && (
                <span className="text-sm text-foreground-muted">{genres}</span>
              )}
              <h4 className="font-heading text-xl font-medium leading-7">
                {series.name}
              </h4>
            </div>
            <p className="line-clamp-3 text-sm leading-5 text-foreground">
              {series.synopsis}
            </p>
            <div className="flex items-center gap-3">
              <Button variant="primary" className="flex-1 bg-secondary">
                <PlayIcon />
                watch
              </Button>
              <Button
                variant="pale"
                size="icon-md"
                render={
                  <Link href={buildSeriesHref(series.id)} scroll={false} />
                }
              >
                <InfoIcon />
              </Button>
              <Button variant="pale" size="icon-md">
                <BookmarkIcon />
              </Button>
            </div>
          </div>
        </div>
      }
    >
      <button className="series-card flex w-[clamp(150px,14vw,220px)] shrink-0 flex-col gap-2">
        {cardImage ? (
          <Image
            src={buildMediaUrl(cardImage.media.purpose, cardImage.media.key)}
            alt={series.name}
            width={200}
            height={300}
            className="rounded-lg aspect-2/3 w-full object-cover"
          />
        ) : (
          <div className="aspect-2/3 w-full rounded-lg bg-white/10" />
        )}
        <div className="flex flex-col gap-1 items-start">
          {genres && (
            <span className="text-xs text-foreground-muted">{genres}</span>
          )}
          <h5 className="font-heading leading-6 font-semibold">
            {series.name}
          </h5>
        </div>
      </button>
    </CardPopover>
  );
}
