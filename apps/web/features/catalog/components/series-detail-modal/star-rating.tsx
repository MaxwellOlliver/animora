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
        {Array.from({ length: 5 }).map((_, i) => (
          <StarIcon
            key={i}
            className={cn(
              starSize,
              i < Math.round(rating)
                ? "fill-warning text-warning"
                : "fill-foreground-muted/30 text-foreground-muted/30",
            )}
          />
        ))}
      </div>
      {count && (
        <span className="text-sm text-foreground-muted">
          {rating} ({count})
        </span>
      )}
    </div>
  );
}
