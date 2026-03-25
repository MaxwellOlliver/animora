import { EllipsisVerticalIcon } from "lucide-react";
import { EpisodeThumbnail } from "@/app/components/ui/episode-thumbnail";

interface EpisodeRowProps {
  number: number;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
}

export function EpisodeRow({
  number,
  title,
  description,
  thumbnail,
  duration,
}: EpisodeRowProps) {
  return (
    <div className="relative flex gap-3 rounded-lg py-2 after:pointer-events-none after:absolute after:inset-y-0 after:-inset-x-2 after:rounded-lg after:bg-elevated after:opacity-0 after:transition-opacity hover:after:opacity-100">
      <EpisodeThumbnail
        src={thumbnail}
        alt={title}
        duration={duration}
        className="z-10 w-40"
      />
      <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-heading text-sm font-semibold">
            E{number} – {title}
          </h4>
          <button
            type="button"
            className="shrink-0 text-foreground-muted hover:text-foreground"
          >
            <EllipsisVerticalIcon className="size-4" />
          </button>
        </div>
        <p className="line-clamp-2 text-xs leading-relaxed text-foreground-muted">
          {description}
        </p>
      </div>
    </div>
  );
}
