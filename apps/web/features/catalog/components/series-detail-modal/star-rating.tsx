import { StarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  count?: string;
  starSize?: string;
}

export function StarRating({
  rating,
  count,
  starSize = "size-4",
}: StarRatingProps) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const fill = Math.min(1, Math.max(0, rating - i));

          return (
            <div key={i} className={cn("relative", starSize)}>
              <StarIcon className={cn("absolute inset-0", starSize, "fill-foreground-muted/30 text-foreground-muted/30")} />
              {fill > 0 && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fill * 100}%` }}
                >
                  <StarIcon className={cn(starSize, "fill-warning text-warning")} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {count && (
        <span className="text-sm text-foreground-muted">
          {rating} ({count})
        </span>
      )}
    </div>
  );
}
