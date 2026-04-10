"use client";

import { useState } from "react";
import { ChevronDown, Heart, MessageCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { Toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

import type { CommentReactionValue } from "../queries/fetch-episode-comments";

type ReactionState = {
  likes: number;
  dislikes: number;
  myReaction: CommentReactionValue | null;
};

function applyReaction(
  current: ReactionState,
  next: CommentReactionValue | null,
): ReactionState {
  let { likes, dislikes } = current;
  if (current.myReaction === "like") likes -= 1;
  if (current.myReaction === "dislike") dislikes -= 1;
  if (next === "like") likes += 1;
  if (next === "dislike") dislikes += 1;
  return {
    likes: Math.max(0, likes),
    dislikes: Math.max(0, dislikes),
    myReaction: next,
  };
}

interface CommentReactionsProps {
  commentId: string;
  initial: ReactionState;
  onReply: () => void;
  size?: string;
}

export function CommentReactions({
  commentId,
  initial,
  onReply,
  size = "size-4",
}: CommentReactionsProps) {
  const toastManager = Toast.useToastManager();
  const [state, setState] = useState<ReactionState>(initial);

  const mutation = useMutation({
    mutationFn: async (next: CommentReactionValue | null) => {
      const response = await fetch(
        `/api/proxy/comments/${commentId}/reaction`,
        {
          method: next ? "PUT" : "DELETE",
          headers: next ? { "Content-Type": "application/json" } : undefined,
          body: next ? JSON.stringify({ value: next }) : undefined,
        },
      );
      if (!response.ok && response.status !== 204) {
        throw new Error("Failed to update reaction");
      }
      return next;
    },
    onMutate: (next) => {
      const previous = state;
      setState((current) => applyReaction(current, next));
      return { previous };
    },
    onError: (_error, _next, context) => {
      if (context?.previous) setState(context.previous);
      toastManager.add({
        title: "Could not update reaction",
        description: "Please try again.",
        type: "error",
      });
    },
  });

  function handleReact(value: CommentReactionValue) {
    const next = state.myReaction === value ? null : value;
    mutation.mutate(next);
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        aria-pressed={state.myReaction === "like"}
        disabled={mutation.isPending}
        onClick={() => handleReact("like")}
        className={cn(
          "flex items-center gap-1.5 text-sm text-foreground-muted transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-60",
          state.myReaction === "like" &&
            "text-primary [&_svg]:fill-primary hover:text-primary",
        )}
      >
        <Heart className={size} />
        <span>{state.likes}</span>
      </button>
      <button
        type="button"
        aria-pressed={state.myReaction === "dislike"}
        disabled={mutation.isPending}
        onClick={() => handleReact("dislike")}
        className={cn(
          "flex items-center gap-1.5 text-sm text-foreground-muted transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-60",
          state.myReaction === "dislike" &&
            "text-secondary hover:text-secondary",
        )}
      >
        <ChevronDown className={size} />
        <span>{state.dislikes}</span>
      </button>
      <button
        type="button"
        className="flex items-center gap-1.5 text-sm text-foreground-muted transition-colors hover:text-primary"
        onClick={onReply}
      >
        <MessageCircle className={size} />
        reply
      </button>
    </div>
  );
}
