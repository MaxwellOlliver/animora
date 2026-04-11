"use client";

import { useMutation } from "@tanstack/react-query";
import { ChevronDown,Heart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

import { WatchPartyButton } from "./watch-party-button";

type EpisodeRatingValue = "like" | "dislike";

type EpisodeInfoProps = {
  episodeId: string;
  episodeNumber: number;
  title: string;
  seriesId: string;
  seriesName: string;
  description?: string | null;
  releasedAt: string;
  likes: number;
  dislikes: number;
  myRating: EpisodeRatingValue | null;
};

export function EpisodeInfo({
  episodeId,
  episodeNumber,
  title,
  seriesId,
  seriesName,
  description,
  releasedAt,
  likes,
  dislikes,
  myRating,
}: EpisodeInfoProps) {
  const toastManager = Toast.useToastManager();
  const [ratingState, setRatingState] = useState({
    dislikes,
    likes,
    myRating,
  });

  const ratingMutation = useMutation({
    mutationFn: async (nextRating: EpisodeRatingValue | null) => {
      const response = await fetch(`/api/proxy/episodes/${episodeId}/rating`, {
        method: nextRating ? "PUT" : "DELETE",
        headers: nextRating
          ? { "Content-Type": "application/json" }
          : undefined,
        body: nextRating ? JSON.stringify({ value: nextRating }) : undefined,
      });

      if (!response.ok && response.status !== 204) {
        throw new Error("Failed to update rating");
      }

      return nextRating;
    },
    onMutate: (nextRating) => {
      const previousState = ratingState;
      setRatingState((current) => applyRating(current, nextRating));

      return { previousState };
    },
    onError: (_error, _nextRating, context) => {
      if (context?.previousState) {
        setRatingState(context.previousState);
      }

      toastManager.add({
        title: "Could not update rating",
        description: "Please try again.",
        type: "error",
      });
    },
  });

  function handleRate(nextRating: EpisodeRatingValue) {
    const value = ratingState.myRating === nextRating ? null : nextRating;
    ratingMutation.mutate(value);
  }

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-heading text-2xl font-semibold leading-8">
        E{episodeNumber} - {title}
      </h1>

      <div className="flex flex-col gap-4">
        <Link
          href={`/series/${seriesId}`}
          className="font-heading text-base w-fit font-semibold text-secondary hover:underline"
        >
          {seriesName}
        </Link>

        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-pressed={ratingState.myRating === "like"}
            data-active={ratingState.myRating === "like"}
            disabled={ratingMutation.isPending}
            onClick={() => handleRate("like")}
            className={cn(
              "flex items-center gap-1.5 text-foreground-muted transition-all duration-200 hover:text-foreground disabled:pointer-events-none disabled:opacity-60",
              ratingState.myRating === "like" &&
                "text-primary [&_svg]:fill-primary hover:text-primary",
            )}
          >
            <Heart className="size-4" />
            <span className="text-sm">{ratingState.likes}</span>
          </button>
          <button
            type="button"
            aria-pressed={ratingState.myRating === "dislike"}
            data-active={ratingState.myRating === "dislike"}
            disabled={ratingMutation.isPending}
            onClick={() => handleRate("dislike")}
            className={cn(
              "flex items-center gap-1.5 text-foreground-muted transition-all duration-200 hover:text-foreground disabled:pointer-events-none disabled:opacity-60",
              ratingState.myRating === "dislike" &&
                "text-secondary hover:text-secondary",
            )}
          >
            <ChevronDown className="size-4" />
            <span className="text-sm">{ratingState.dislikes}</span>
          </button>

          <div className="h-5 w-px bg-border" />

          <WatchPartyButton />
        </div>

        {description ? (
          <p className="line-clamp-2 text-base leading-6 text-foreground">
            {description}
          </p>
        ) : null}

        <span className="text-sm leading-5 text-foreground-muted">
          Released at {releasedAt}
        </span>
      </div>
    </div>
  );
}

function applyRating(
  current: {
    dislikes: number;
    likes: number;
    myRating: EpisodeRatingValue | null;
  },
  nextRating: EpisodeRatingValue | null,
) {
  let likes = current.likes;
  let dislikes = current.dislikes;

  if (current.myRating === "like") {
    likes -= 1;
  }

  if (current.myRating === "dislike") {
    dislikes -= 1;
  }

  if (nextRating === "like") {
    likes += 1;
  }

  if (nextRating === "dislike") {
    dislikes += 1;
  }

  return {
    likes: Math.max(0, likes),
    dislikes: Math.max(0, dislikes),
    myRating: nextRating,
  };
}
