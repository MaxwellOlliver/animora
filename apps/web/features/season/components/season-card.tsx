import { ClockIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { buildMediaUrl } from "@/utils/media-utils";
import { WEEKDAY_LABELS } from "@/utils/weekday";

import type { SeasonEntry } from "../types";

const STATUS_LABELS: Record<NonNullable<SeasonEntry["status"]>, string> = {
  airing: "Airing",
  upcoming: "Upcoming",
  finished: "Finished",
};

function formatSchedule(
  weekday: number | null,
  time: string | null,
): string | null {
  const day = weekday != null ? WEEKDAY_LABELS[weekday] : null;
  const hour = time ? time.slice(0, 5) : null;

  if (day && hour) return `${day} ${hour}`;
  return day ?? hour;
}

function playlistLabel(entry: SeasonEntry): string {
  if (entry.playlistTitle) return entry.playlistTitle;
  if (entry.type === "movie") return "Movie";
  if (entry.type === "special") return "Special";
  return `Season ${entry.playlistNumber}`;
}

interface SeasonCardProps {
  entry: SeasonEntry;
}

export function SeasonCard({ entry }: SeasonCardProps) {
  const image = entry.playlistCover ?? entry.seriesPoster ?? entry.seriesBanner;
  const imageSrc = image ? buildMediaUrl(image.purpose, image.key) : null;
  const schedule = formatSchedule(entry.releaseWeekday, entry.releaseTime);

  return (
    <Link
      href={`/series/${entry.seriesId}`}
      scroll={false}
      className="season-card -m-2 flex w-[clamp(140px,12vw,180px)] shrink-0 flex-col gap-1.5 rounded-xl p-2 outline-none transition-colors hover:bg-white/5 focus-visible:bg-white/5"
    >
      <div className="relative aspect-2/3 w-full overflow-hidden rounded-lg">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={entry.seriesName}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="size-full bg-white/10" />
        )}
        {entry.status && (
          <span
            className={cn(
              "absolute top-1.5 left-1.5 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white",
              entry.status === "airing" && "bg-secondary",
              entry.status === "upcoming" && "bg-white/20",
              entry.status === "finished" && "bg-black/70",
            )}
          >
            {STATUS_LABELS[entry.status]}
          </span>
        )}
        {schedule && (
          <span className="absolute top-1.5 right-1.5 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium">
            <ClockIcon className="size-2.5" />
            {schedule}
          </span>
        )}
      </div>
      <div className="flex flex-col">
        <span className="line-clamp-1 text-sm font-medium leading-5">
          {entry.seriesName}
        </span>
        <span className="text-xs uppercase text-foreground-muted">
          {playlistLabel(entry)}
        </span>
      </div>
    </Link>
  );
}
