import Image from "next/image";
import { PlayIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardPopover } from "./card-popover";
import { TrailerPlayer } from "./trailer-player";

export function EpisodeCard() {
  return (
    <CardPopover
      content={
        <div className="flex w-[clamp(280px,23vw,350px)] flex-col">
          <div className="aspect-video w-full overflow-clip">
            <TrailerPlayer
              src={null}
              poster="/images/episode-thumbnail.png"
              alt="That day"
            />
          </div>
          <div className="flex flex-col gap-2 p-4">
            <span className="text-sm text-foreground-muted">
              Attack on Titan
            </span>
            <h4 className="font-heading text-xl font-medium leading-7">
              That day
            </h4>
            <div className="flex items-center gap-4 text-sm text-foreground-muted">
              <span>S1 E4</span>
              <span>24:32</span>
            </div>
            <p className="line-clamp-3 text-sm leading-5 text-foreground">
              The Colossal Titan has breached the wall, and Eren must face the
              horror that lies beyond it.
            </p>
            <Button variant="primary" className="bg-secondary">
              <PlayIcon />
              watch
            </Button>
          </div>
        </div>
      }
    >
      <div className="episode-card flex w-[clamp(180px,18vw,260px)] shrink-0 flex-col gap-2">
        <Image
          src="/images/episode-thumbnail.png"
          alt="Episode Thumbnail"
          width={300}
          height={169}
          className="rounded-lg aspect-video w-full"
          unoptimized
        />
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase text-foreground-muted">
            Attack on Titan
          </span>
          <span className="text-xs text-foreground-muted">S1 E4</span>
          <h5 className="font-heading leading-6 font-semibold">That day</h5>
        </div>
      </div>
    </CardPopover>
  );
}
