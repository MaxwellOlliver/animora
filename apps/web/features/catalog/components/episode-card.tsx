import Image from "next/image";

export function EpisodeCard() {
  return (
    <div className="episode-card flex w-[clamp(180px,18vw,260px)] shrink-0 flex-col gap-2">
      <Image
        src="/images/episode-thumbnail.png"
        alt="Episode Thumbnail"
        width={300}
        height={169}
        className="rounded-lg aspect-video w-full"
      />
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase text-foreground-muted">
          Attack on Titan
        </span>
        <span className="text-xs text-foreground-muted">S1 E4</span>
        <h5 className="font-heading leading-6 font-semibold">That day</h5>
      </div>
    </div>
  );
}
