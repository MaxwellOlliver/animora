import Image from "next/image";

export function SeriesCard() {
  return (
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
  );
}
