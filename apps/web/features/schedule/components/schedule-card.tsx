import { ClockIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { EpisodeThumbnail } from "@/components/ui/episode-thumbnail";
import { cn } from "@/lib/utils";
import { buildMediaUrl } from "@/utils/media-utils";

import type { ScheduleEntry } from "../types";

const cardLinkClassName =
  "schedule-card -m-2 flex flex-col gap-1.5 rounded-xl p-2 outline-none transition-colors hover:bg-white/5 focus-visible:bg-white/5";

function formatTime(time: string | null): string | null {
  return time ? time.slice(0, 5) : null;
}

interface ScheduleCardProps {
  entry: ScheduleEntry;
}

export function ScheduleCard({ entry }: ScheduleCardProps) {
  const episodeThumbnail = entry.kind === "episode" ? entry.thumbnail : null;
  const image = episodeThumbnail ?? entry.seriesBanner ?? entry.seriesPoster;
  const imageSrc = image ? buildMediaUrl(image.purpose, image.key) : null;

  const canWatch = entry.kind === "episode" && entry.available;
  const href = canWatch ? `/watch/${entry.id}` : `/series/${entry.seriesId}`;
  const isFirstEpisode = entry.kind === "episode" && entry.number === 1;
  const time =
    entry.kind === "episode"
      ? formatTime(entry.releaseDate.slice(11, 16))
      : formatTime(entry.releaseTime);

  if (canWatch && imageSrc) {
    return (
      <Link href={href} className={cardLinkClassName}>
        <div className="relative">
          <EpisodeThumbnail src={imageSrc} alt={entry.title} />
          {time && (
            <span className="absolute top-1.5 right-1.5 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium">
              <ClockIcon className="size-2.5" />
              {time}
            </span>
          )}
          {isFirstEpisode && (
            <span className="absolute top-1.5 left-1.5 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
              New
            </span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-xs uppercase text-foreground-muted">
            {entry.seriesName}
          </span>
          <span className="line-clamp-1 text-sm font-medium leading-5">
            EP {entry.number} - {entry.title}
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      scroll={false}
      className={cn(cardLinkClassName, "opacity-60 hover:opacity-100")}
    >
      <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={entry.seriesName}
            fill
            className="object-cover brightness-75"
            unoptimized
          />
        ) : (
          <div className="size-full bg-white/10" />
        )}
        {time && (
          <span className="absolute top-1.5 right-1.5 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium">
            <ClockIcon className="size-2.5" />
            {time}
          </span>
        )}
        {isFirstEpisode && (
          <span className="absolute top-1.5 left-1.5 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
            New
          </span>
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-xs uppercase text-foreground-muted">
          {entry.seriesName}
        </span>
        <span className="line-clamp-1 text-sm font-medium leading-5">
          {entry.kind === "episode"
            ? `EP ${entry.number} - ${entry.title}`
            : "Coming soon"}
        </span>
      </div>
    </Link>
  );
}
