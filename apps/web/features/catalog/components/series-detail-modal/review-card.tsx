import Image from "next/image";
import { PencilIcon, TrashIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildMediaUrl } from "@/utils/media-utils";
import { StarRating } from "./star-rating";
import type { SeriesReview } from "../../queries/fetch-series-reviews";

interface ReviewCardProps {
  review: SeriesReview;
  highlighted?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ReviewCard({
  review,
  highlighted,
  onEdit,
  onDelete,
}: ReviewCardProps) {
  const avatarUrl = review.profile.avatar
    ? buildMediaUrl(
        review.profile.avatar.purpose as Parameters<typeof buildMediaUrl>[0],
        review.profile.avatar.key,
      )
    : "/images/avatar-placeholder.svg";

  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        highlighted && "rounded-lg border border-primary/20 bg-primary/5 p-3",
      )}
    >
      <div className="flex items-center gap-3">
        <Image
          src={avatarUrl}
          alt={review.profile.name}
          width={36}
          height={36}
          className="size-9 rounded-lg object-cover"
          unoptimized
        />
        <div className="flex flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{review.profile.name}</span>
            {highlighted && (
              <span className="text-xs text-primary">Your review</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <StarRating rating={review.rating} starSize="size-3" />
            <span className="text-xs text-foreground-muted">
              {review.rating}
            </span>
          </div>
        </div>
        {highlighted && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="rounded p-1 text-foreground-muted hover:text-foreground"
              onClick={onEdit}
            >
              <PencilIcon className="size-3.5" />
            </button>
            <button
              type="button"
              className="rounded p-1 text-foreground-muted hover:text-red-400"
              onClick={onDelete}
            >
              <TrashIcon className="size-3.5" />
            </button>
          </div>
        )}
      </div>
      <p className="text-sm leading-relaxed text-foreground-muted">
        {review.text}
      </p>
    </div>
  );
}
