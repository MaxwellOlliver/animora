export function SeriesCardSkeleton() {
  return (
    <div className="flex w-[clamp(150px,14vw,220px)] shrink-0 flex-col gap-2 not-last:mr-4">
      <div className="aspect-2/3 w-full animate-pulse rounded-lg bg-white/10" />
      <div className="flex flex-col gap-1">
        <div className="h-3 w-2/3 animate-pulse rounded bg-white/10" />
        <div className="h-5 w-4/5 animate-pulse rounded bg-white/10" />
      </div>
    </div>
  );
}
