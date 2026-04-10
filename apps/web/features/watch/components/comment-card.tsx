"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { buildMediaUrl } from "@/utils/media-utils";
import {
  buildFetchCommentRepliesQueryOptions,
  type TopLevelComment,
  type ReplyComment,
  type CommentProfile,
} from "../queries/fetch-episode-comments";
import { CommentInput } from "./comment-input";
import { CommentReactions } from "./comment-reactions";
import type { CommentForm } from "../schemas/comment";

interface CommentCardProps {
  comment: TopLevelComment;
  episodeId: string;
  currentProfileAvatar?: { key: string; purpose: string } | null;
}

function ProfileAvatar({
  profile,
  size = "size-10",
}: {
  profile: CommentProfile;
  size?: string;
}) {
  const src = profile.avatar
    ? buildMediaUrl(
        profile.avatar.purpose as Parameters<typeof buildMediaUrl>[0],
        profile.avatar.key,
      )
    : "/images/avatar-placeholder.svg";
  return (
    <Avatar
      src={src}
      alt={profile.name}
      className={`${size} shrink-0 rounded-lg`}
    />
  );
}

function SpoilerText({ text, spoiler }: { text: string; spoiler: boolean }) {
  const [revealed, setRevealed] = useState(false);

  if (!spoiler || revealed) {
    return <p className="text-sm leading-5 text-foreground">{text}</p>;
  }

  return (
    <button
      type="button"
      className="text-left"
      onClick={() => setRevealed(true)}
    >
      <p className="select-none text-sm leading-5 text-foreground blur-xs transition-[filter] hover:blur-[3px]">
        {text}
      </p>
    </button>
  );
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function CommentCard({
  comment,
  episodeId,
  currentProfileAvatar,
}: CommentCardProps) {
  const queryClient = useQueryClient();
  const [showReplies, setShowReplies] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    profileName: string;
  } | null>(null);

  const {
    data: repliesPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    ...buildFetchCommentRepliesQueryOptions(episodeId, comment.id),
    enabled: showReplies,
  });

  const replies = repliesPages?.pages.flatMap((p) => p.items) ?? [];

  const replyMutation = useMutation({
    mutationFn: async (data: CommentForm) => {
      const response = await fetch(
        `/api/proxy/episodes/${episodeId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: data.text,
            spoiler: data.spoiler,
            parentId: comment.id,
            replyToId: replyingTo?.id ?? comment.id,
          }),
        },
      );
      if (!response.ok) throw new Error("Failed to post reply");
      return response.json();
    },
    onSuccess: () => {
      setReplyingTo(null);
      queryClient.invalidateQueries({
        queryKey: ["episodes", episodeId, "comments", comment.id, "replies"],
      });
      queryClient.invalidateQueries({
        queryKey: ["episodes", episodeId, "comments"],
      });
      if (!showReplies) setShowReplies(true);
    },
  });

  function handleReplyToRoot() {
    setReplyingTo({ id: comment.id, profileName: comment.profile.name });
    if (!showReplies && comment.replyCount > 0) setShowReplies(true);
  }

  function handleReplyToReply(reply: ReplyComment) {
    setReplyingTo({ id: reply.id, profileName: reply.profile.name });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2.5">
        <ProfileAvatar profile={comment.profile} />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-normal text-white">
              {comment.profile.name}
            </span>
            <span className="text-xs text-foreground-muted">
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>
          <SpoilerText text={comment.text} spoiler={comment.spoiler} />
          <CommentReactions
            commentId={comment.id}
            initial={{
              likes: comment.likes,
              dislikes: comment.dislikes,
              myReaction: comment.myReaction,
            }}
            onReply={handleReplyToRoot}
          />
          {comment.replyCount > 0 && (
            <button
              type="button"
              className="flex w-fit items-center gap-1.5 text-sm text-secondary transition-colors hover:underline"
              onClick={() => setShowReplies(!showReplies)}
            >
              <ChevronDown
                className={cn(
                  "size-4 transition-transform",
                  showReplies && "rotate-180",
                )}
              />
              {comment.replyCount}{" "}
              {comment.replyCount === 1 ? "reply" : "replies"}
            </button>
          )}
        </div>
      </div>

      {showReplies && replies.length > 0 && (
        <div className="flex flex-col gap-3 pl-13">
          {replies.map((reply) => (
            <div key={reply.id} className="flex gap-2.5">
              <ProfileAvatar profile={reply.profile} size="size-8" />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-normal text-white">
                    {reply.profile.name}
                  </span>
                  <span className="text-xs text-foreground-muted">
                    {formatTimeAgo(reply.createdAt)}
                  </span>
                </div>
                {reply.replyTo && (
                  <span className="text-xs text-foreground-muted">
                    replying to{" "}
                    <span className="text-secondary">
                      {reply.replyTo.profileName}
                    </span>
                  </span>
                )}
                <SpoilerText text={reply.text} spoiler={reply.spoiler} />
                <CommentReactions
                  commentId={reply.id}
                  initial={{
                    likes: reply.likes,
                    dislikes: reply.dislikes,
                    myReaction: reply.myReaction,
                  }}
                  onReply={() => handleReplyToReply(reply)}
                  size="size-3.5"
                />
              </div>
            </div>
          ))}

          {hasNextPage && (
            <button
              type="button"
              className="text-sm text-secondary hover:underline"
              disabled={isFetchingNextPage}
              onClick={() => fetchNextPage()}
            >
              {isFetchingNextPage ? "Loading..." : "Load more replies"}
            </button>
          )}
        </div>
      )}

      {replyingTo && (
        <div className="pl-13">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-foreground-muted">
              Replying to{" "}
              <span className="text-secondary">{replyingTo.profileName}</span>
            </span>
            <button
              type="button"
              className="text-xs text-foreground-muted hover:text-foreground"
              onClick={() => setReplyingTo(null)}
            >
              cancel
            </button>
          </div>
          <CommentInput
            avatar={currentProfileAvatar}
            onSubmit={(data) => replyMutation.mutate(data)}
            isPending={replyMutation.isPending}
            placeholder={`Reply to ${replyingTo.profileName}...`}
          />
        </div>
      )}
    </div>
  );
}
