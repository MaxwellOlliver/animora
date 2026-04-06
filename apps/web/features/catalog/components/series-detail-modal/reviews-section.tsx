"use client";

import { useState } from "react";
import { PencilIcon, PlusIcon, StarIcon } from "lucide-react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { buildFetchSeriesReviewsQueryOptions } from "../../queries/fetch-series-reviews";
import { buildFetchMyReviewQueryOptions } from "../../queries/fetch-my-review";
import { ReviewCard } from "./review-card";

interface ReviewsSectionProps {
  seriesId: string;
}

export function ReviewsSection({ seriesId }: ReviewsSectionProps) {
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [text, setText] = useState("");

  const { data: myReview } = useQuery(
    buildFetchMyReviewQueryOptions(seriesId),
  );

  const {
    data: reviewsPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(buildFetchSeriesReviewsQueryOptions(seriesId));

  const reviews = reviewsPages?.pages.flatMap((p) => p.items) ?? [];

  const invalidateReviews = () => {
    queryClient.invalidateQueries({
      queryKey: ["catalog", "series", seriesId, "reviews"],
    });
    queryClient.invalidateQueries({
      queryKey: ["catalog", "series", seriesId, "my-review"],
    });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const isUpdate = !!myReview;
      const response = await fetch(`/api/proxy/series/${seriesId}/review`, {
        method: isUpdate ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, text }),
      });
      if (!response.ok) throw new Error("Failed to save review");
      return response.json();
    },
    onSuccess: () => {
      invalidateReviews();
      setIsEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/proxy/series/${seriesId}/review`, {
        method: "DELETE",
      });
      if (!response.ok && response.status !== 204)
        throw new Error("Failed to delete review");
    },
    onSuccess: () => {
      invalidateReviews();
      setIsEditing(false);
      setRating(0);
      setText("");
    },
  });

  function handleStartEdit() {
    if (myReview) {
      setRating(myReview.rating);
      setText(myReview.text);
    } else {
      setRating(0);
      setText("");
    }
    setIsEditing(true);
  }

  function handleCancel() {
    setIsEditing(false);
    setRating(0);
    setText("");
  }

  const displayedRating = hoveredStar || rating;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-semibold">Reviews</h3>
        {!isEditing && (
          <button
            type="button"
            className="flex items-center gap-1.5 text-sm text-secondary hover:underline"
            onClick={handleStartEdit}
          >
            {myReview ? (
              <>
                <PencilIcon className="size-4" />
                edit review
              </>
            ) : (
              <>
                <PlusIcon className="size-4" />
                add review
              </>
            )}
          </button>
        )}
      </div>

      {isEditing && (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card-alt p-4">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                type="button"
                className="p-0.5"
                onMouseEnter={() => setHoveredStar(i + 1)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setRating(i + 1)}
              >
                <StarIcon
                  className={cn(
                    "size-5 transition-colors",
                    i < displayedRating
                      ? "fill-warning text-warning"
                      : "fill-foreground-muted/30 text-foreground-muted/30",
                  )}
                />
              </button>
            ))}
          </div>
          <textarea
            className="min-h-24 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-foreground-muted focus:border-primary focus:outline-none"
            placeholder="Write your review..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={2000}
          />
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              disabled={!rating || !text.trim() || saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? "Saving..." : "Save"}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            {myReview && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-red-400 hover:text-red-300"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate()}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-5">
        {myReview && !isEditing && (
          <ReviewCard
            review={myReview}
            highlighted
            onEdit={handleStartEdit}
            onDelete={() => deleteMutation.mutate()}
          />
        )}

        {reviews
          .filter((r) => r.id !== myReview?.id)
          .map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}

        {reviews.length === 0 && !myReview && !isEditing && (
          <p className="text-sm text-foreground-muted">
            No reviews yet. Be the first to review!
          </p>
        )}

        {hasNextPage && (
          <button
            type="button"
            className="text-sm text-secondary hover:underline"
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            {isFetchingNextPage ? "Loading..." : "Load more reviews"}
          </button>
        )}
      </div>
    </section>
  );
}
