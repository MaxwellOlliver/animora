import { EpisodeThumbnail } from "@/app/components/ui/episode-thumbnail";

interface SidebarEpisodeCardProps {
  progress?: number;
}

export function SidebarEpisodeCard({ progress }: SidebarEpisodeCardProps) {
  return (
    <div className="relative flex items-center gap-4 rounded-xl py-2 after:pointer-events-none after:absolute after:-inset-x-2 after:inset-y-0 after:rounded-lg after:bg-elevated after:opacity-0 after:transition-opacity hover:after:opacity-100">
      <EpisodeThumbnail
        src="/images/episode-thumbnail.png"
        alt="Episode thumbnail"
        duration="24m 32s"
        progress={progress}
        className="z-10 w-44"
      />

      <div className="z-10 flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-sm leading-5 text-foreground-muted">
          Attack on Titan
        </span>
        <h4 className="line-clamp-2 font-heading text-base font-medium leading-6">
          E1 - To you, 2000 years from now
        </h4>
      </div>
    </div>
  );
}
