import Image from "next/image";
import { EllipsisVerticalIcon } from "lucide-react";

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
      <div className="relative z-10 aspect-video w-40 shrink-0 overflow-clip rounded-md">
        <Image
          src={thumbnail}
          alt={title}
          fill
          className="object-cover"
          unoptimized
        />
        <span className="absolute bottom-1.5 left-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium">
          {duration}
        </span>
      </div>
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
