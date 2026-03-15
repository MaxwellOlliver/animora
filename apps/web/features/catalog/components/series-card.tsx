import Image from "next/image";
import { BookmarkIcon, InfoIcon, PlayIcon } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { CardPopover } from "./card-popover";
import { TrailerPlayer } from "./trailer-player";

export function SeriesCard() {
  return (
    <CardPopover
      content={
        <div className="flex w-[clamp(280px,23vw,350px)] flex-col">
          <div className="aspect-video w-full overflow-clip">
            <TrailerPlayer
              src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
              poster="/images/catalog/aot-banner.jpg"
              alt="Attack on Titan"
            />
          </div>
          <div className="flex flex-col gap-2 p-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm text-foreground-muted">
                Action • Comedy
              </span>
              <h4 className="font-heading text-xl font-medium leading-7">
                Attack on Titan
              </h4>
            </div>
            <div className="flex items-center gap-4 text-sm text-foreground-muted">
              <Image
                src="/images/plus-16.png"
                alt=""
                width={24}
                height={24}
                className="size-4"
              />
              <span>5 seasons</span>
              <span>1 movie</span>
            </div>
            <p className="line-clamp-3 text-sm leading-5 text-foreground">
              Attack on Titan is set in a world where humanity lives inside
              cities surrounded by enormous Walls that protect them from Titans,
              gigantic humanoid creatures who devour humans seemingly without
              reason.
            </p>
            <div className="flex items-center gap-3">
              <Button variant="primary" className="flex-1 bg-secondary">
                <PlayIcon />
                watch
              </Button>
              <Button variant="pale" size="icon-md">
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
        <Image
          src="/images/aot-poster.png"
          alt="Series Poster"
          width={200}
          height={300}
          className="rounded-lg aspect-2/3 w-full"
        />
        <div className="flex flex-col gap-1 items-start">
          <span className="text-xs text-foreground-muted">Action • Comedy</span>
          <h5 className="font-heading leading-6 font-semibold">
            Attack on Titan
          </h5>
        </div>
      </button>
    </CardPopover>
  );
}
