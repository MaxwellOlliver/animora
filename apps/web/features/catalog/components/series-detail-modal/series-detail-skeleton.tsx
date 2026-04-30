function Bone({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-white/10 ${className ?? ""}`} />
  );
}

function EpisodeRowSkeleton() {
  return (
    <div className="flex gap-3 py-2">
      <Bone className="aspect-video w-40 shrink-0 rounded-md" />
      <div className="flex min-w-0 flex-1 flex-col gap-2 pt-1">
        <Bone className="h-4 w-3/5" />
        <Bone className="h-3 w-full" />
        <Bone className="h-3 w-4/5" />
      </div>
    </div>
  );
}

function TrailerCardSkeleton() {
  return (
    <div className="flex w-40 shrink-0 flex-col gap-2 py-2">
      <Bone className="aspect-video w-full rounded-md" />
      <Bone className="h-4 w-3/4" />
    </div>
  );
}

function ReviewCardSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <Bone className="size-9 rounded-full" />
        <div className="flex flex-col gap-1">
          <Bone className="h-3.5 w-24" />
          <Bone className="h-3 w-16" />
        </div>
      </div>
      <Bone className="h-3 w-full" />
      <Bone className="h-3 w-5/6" />
      <Bone className="h-3 w-2/3" />
    </div>
  );
}

export function SeriesDetailSkeleton() {
  return (
    <div className="relative w-full max-w-4xl rounded-xl bg-card shadow-2xl">
      {/* Banner */}
      <div className="relative">
        <Bone className="aspect-video w-full rounded-t-xl" />
        <div className="pointer-events-none absolute inset-0 aspect-video rounded-t-xl bg-linear-to-t from-card from-0% via-card/80 via-35% to-transparent to-100%" />

        {/* Hero overlay content */}
        <div className="relative z-10 -mt-64 flex flex-col gap-4 px-6 pb-6">
          {/* Logo placeholder */}
          <Bone className="h-24 w-60" />

          {/* Star rating */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Bone key={i} className="size-4 rounded-sm" />
            ))}
            <Bone className="ml-1 h-4 w-16" />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <Bone className="h-9 w-44 rounded-md" />
            <Bone className="size-9 rounded-md" />
          </div>

          {/* Description area */}
          <div className="flex gap-6">
            <div className="flex flex-1 flex-col gap-2">
              <Bone className="h-3 w-full" />
              <Bone className="h-3 w-full" />
              <Bone className="h-3 w-3/4" />
            </div>
            <div className="flex w-48 shrink-0 flex-col gap-2">
              <Bone className="h-3 w-32" />
              <Bone className="h-3 w-28" />
              <Bone className="h-3 w-36" />
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-6 px-6 pb-6">
        {/* Episodes */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Bone className="h-5 w-24" />
            <Bone className="h-8 w-32 rounded-md" />
          </div>
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <EpisodeRowSkeleton key={i} />
            ))}
          </div>
        </section>

        {/* Trailers */}
        <section className="flex flex-col gap-3">
          <Bone className="h-5 w-20" />
          <div className="flex gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <TrailerCardSkeleton key={i} />
            ))}
          </div>
        </section>

        {/* Reviews */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Bone className="h-5 w-20" />
            <Bone className="h-4 w-24" />
          </div>
          <div className="flex flex-col gap-5">
            {Array.from({ length: 2 }).map((_, i) => (
              <ReviewCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
