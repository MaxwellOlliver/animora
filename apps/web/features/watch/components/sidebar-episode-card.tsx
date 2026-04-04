import Link from "next/link";
import { EpisodeThumbnail } from "@/components/ui/episode-thumbnail";

interface SidebarEpisodeCardProps {
  href?: string;
  seriesName?: string;
  episodeNumber?: number;
  title?: string;
  thumbnailSrc?: string;
  thumbnailAlt?: string;
  duration?: string;
  progress?: number;
}

export function SidebarEpisodeCard({
  href,
  seriesName = "Attack on Titan",
  episodeNumber = 1,
  title = "To you, 2000 years from now",
  thumbnailSrc = "/images/episode-thumbnail.png",
  thumbnailAlt = "Episode thumbnail",
  duration,
  progress,
}: SidebarEpisodeCardProps) {
  const content = (
    <div className="relative flex items-center gap-4 rounded-xl py-2 after:pointer-events-none after:absolute after:-inset-x-2 after:inset-y-0 after:rounded-lg after:bg-elevated after:opacity-0 after:transition-opacity hover:after:opacity-100">
      <EpisodeThumbnail
        src={thumbnailSrc}
        alt={thumbnailAlt}
        duration={duration}
        progress={progress}
        className="z-10 w-36"
      />

      <div className="z-10 flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-sm leading-5 text-foreground-muted">
          {seriesName}
        </span>
        <h4 className="line-clamp-2 font-heading text-base font-medium leading-6">
          {`E${episodeNumber} - ${title}`}
        </h4>
      </div>
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}
