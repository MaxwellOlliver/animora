import Image from "next/image";

export function NextEpisodeCard() {
  return (
    <div className="flex items-center gap-4 rounded-xl">
      <div className="relative h-[99px] w-44 shrink-0 overflow-hidden rounded-lg">
        <Image
          src="/images/episode-thumbnail.png"
          alt="Next episode thumbnail"
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute bottom-2 left-2 rounded bg-background/80 px-1 py-1">
          <span className="text-xs text-white">24m 32s</span>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-sm leading-5 text-foreground-muted">
          Attack on Titan
        </span>
        <h4 className="line-clamp-2 font-heading text-base font-semibold leading-6">
          To you, 2000 years from now
        </h4>
        <span className="truncate text-sm leading-5 text-foreground-muted">
          S1 E2
        </span>
      </div>
    </div>
  );
}
