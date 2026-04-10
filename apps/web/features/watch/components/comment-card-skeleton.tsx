export function CommentCardSkeleton() {
  return (
    <div className="flex gap-2.5">
      <div className="size-10 shrink-0 animate-pulse rounded-lg bg-white/10" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
          <div className="h-3 w-12 animate-pulse rounded bg-white/10" />
        </div>
        <div className="h-3 w-11/12 animate-pulse rounded bg-white/10" />
        <div className="h-3 w-3/4 animate-pulse rounded bg-white/10" />
        <div className="mt-1 flex items-center gap-4">
          <div className="h-3 w-10 animate-pulse rounded bg-white/10" />
          <div className="h-3 w-10 animate-pulse rounded bg-white/10" />
          <div className="h-3 w-12 animate-pulse rounded bg-white/10" />
        </div>
      </div>
    </div>
  );
}
