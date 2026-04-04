import Link from "next/link";
import { Heart, ChevronDown } from "lucide-react";
import { WatchPartyButton } from "./watch-party-button";

type EpisodeInfoProps = {
  episodeNumber: number;
  title: string;
  seriesId: string;
  seriesName: string;
  description?: string | null;
  releasedAt: string;
};

export function EpisodeInfo({
  episodeNumber,
  title,
  seriesId,
  seriesName,
  description,
  releasedAt,
}: EpisodeInfoProps) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-semibold leading-8">
        E{episodeNumber} - {title}
      </h1>

      <div className="flex flex-col gap-4">
        <Link
          href={`/home?s=${seriesId}`}
          className="font-heading text-base w-fit font-semibold text-primary hover:underline"
        >
          {seriesName}
        </Link>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2.5 text-primary">
            <Heart className="size-6" />
            <span className="text-base">246</span>
          </button>
          <button className="flex items-center gap-2.5 text-foreground-muted">
            <ChevronDown className="size-6" />
            <span className="text-base">246</span>
          </button>

          <div className="h-5 w-px bg-border" />

          <WatchPartyButton />
        </div>

        {description ? (
          <p className="line-clamp-2 text-base leading-6 text-foreground">
            {description}
          </p>
        ) : null}

        <span className="text-sm leading-5 text-foreground-muted">
          Released at {releasedAt}
        </span>
      </div>
    </div>
  );
}
