"use client";

import Image from "next/image";
import { PlayIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardPopover } from "./card-popover";
import { TrailerPlayer } from "./trailer-player";
import type { WatchHistoryEpisode } from "../queries/fetch-continue-watching";
import { buildMediaUrl } from "@/utils/media-utils";
import { MEDIA_PURPOSE } from "@animora/contracts";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface EpisodeCardProps {
  entry: WatchHistoryEpisode;
}

export function EpisodeCard({ entry }: EpisodeCardProps) {
  const { episode } = entry;
  const thumbnailSrc = episode.thumbnailUrl
    ? buildMediaUrl(MEDIA_PURPOSE.episodeThumbnail, episode.thumbnailUrl)
    : null;

  const seasonLabel = `S${episode.playlist.number} E${episode.number}`;

  return (
    <CardPopover
      content={
        <div className="flex w-[clamp(280px,23vw,350px)] flex-col">
          <div className="aspect-video w-full overflow-clip">
            <TrailerPlayer
              src={null}
              poster={thumbnailSrc ?? undefined}
              alt={episode.title}
            />
          </div>
          <div className="flex flex-col gap-2 p-4">
            <span className="text-sm text-foreground-muted">
              {episode.series.name}
            </span>
            <h4 className="font-heading text-xl font-medium leading-7">
              {episode.title}
            </h4>
            <div className="flex items-center gap-4 text-sm text-foreground-muted">
              <span>{seasonLabel}</span>
              {episode.durationSeconds && (
                <span>{formatDuration(episode.durationSeconds)}</span>
              )}
            </div>
            <Button variant="primary" className="bg-secondary">
              <PlayIcon />
              watch
            </Button>
          </div>
        </div>
      }
    >
      <div className="episode-card flex w-[clamp(180px,18vw,260px)] shrink-0 flex-col gap-2">
        {thumbnailSrc ? (
          <Image
            src={thumbnailSrc}
            alt={episode.title}
            width={300}
            height={169}
            className="rounded-lg aspect-video w-full object-cover"
          />
        ) : (
          <div className="rounded-lg aspect-video w-full bg-muted" />
        )}
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase text-foreground-muted">
            {episode.series.name}
          </span>
          <span className="text-xs text-foreground-muted">{seasonLabel}</span>
          <h5 className="font-heading leading-6 font-semibold">
            {episode.title}
          </h5>
        </div>
      </div>
    </CardPopover>
  );
}
