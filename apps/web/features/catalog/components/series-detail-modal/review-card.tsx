import Image from "next/image";
import { HeartIcon, MessageCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { StarRating } from "./star-rating";

interface ReviewCardProps {
  name: string;
  avatar: string;
  rating: number;
  text: string;
  likes: number;
  liked?: boolean;
}

export function ReviewCard({
  name,
  avatar,
  rating,
  text,
  likes,
  liked,
}: ReviewCardProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <Image
          src={avatar}
          alt={name}
          width={36}
          height={36}
          className="size-9 rounded-full object-cover"
          unoptimized
        />
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{name}</span>
          <div className="flex items-center gap-1.5">
            <StarRating rating={rating} starSize="size-3" />
            <span className="text-xs text-foreground-muted">{rating}</span>
          </div>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-foreground-muted">{text}</p>
      <div className="flex items-center gap-3 text-xs text-foreground-muted">
        <button
          type="button"
          className={cn(
            "flex items-center gap-1 transition-colors",
            liked ? "text-primary" : "hover:text-foreground",
          )}
        >
          <HeartIcon className={cn("size-3.5", liked && "fill-primary")} />
          {likes}
        </button>
        <button
          type="button"
          className="flex items-center gap-1 hover:text-foreground"
        >
          <MessageCircleIcon className="size-3.5" />
          {likes}
        </button>
      </div>
    </div>
  );
}
