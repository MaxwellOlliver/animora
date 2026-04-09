"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { CommentInput } from "./comment-input";
import { CommentCard } from "./comment-card";
import { buildFetchEpisodeCommentsQueryOptions } from "../queries/fetch-episode-comments";
import type { CommentForm } from "../schemas/comment";

interface CommentsSectionProps {
  episodeId: string;
  currentProfileAvatar?: { key: string; purpose: string } | null;
}

export function CommentsSection({
  episodeId,
  currentProfileAvatar,
}: CommentsSectionProps) {
  const queryClient = useQueryClient();

  const {
    data: commentsPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(buildFetchEpisodeCommentsQueryOptions(episodeId));

  const comments = commentsPages?.pages.flatMap((p) => p.items) ?? [];

  const createMutation = useMutation({
    mutationFn: async (data: CommentForm) => {
      const response = await fetch(
        `/api/proxy/episodes/${episodeId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: data.text, spoiler: data.spoiler }),
        },
      );
      if (!response.ok) throw new Error("Failed to post comment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["episodes", episodeId, "comments"],
      });
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-heading text-xl font-medium leading-7">Comments</h3>

      <CommentInput
        avatar={currentProfileAvatar}
        onSubmit={(data) => createMutation.mutate(data)}
        isPending={createMutation.isPending}
      />

      <div className="flex flex-col gap-4 pt-6">
        {comments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            episodeId={episodeId}
            currentProfileAvatar={currentProfileAvatar}
          />
        ))}

        {comments.length === 0 && (
          <p className="text-sm text-foreground-muted mx-auto">
            No comments yet. Be the first to comment!
          </p>
        )}

        {hasNextPage && (
          <button
            type="button"
            className="text-sm text-secondary hover:underline"
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            {isFetchingNextPage ? "Loading..." : "Load more comments"}
          </button>
        )}
      </div>
    </div>
  );
}
