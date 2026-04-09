import { infiniteQueryOptions } from "@tanstack/react-query";

export type CommentProfile = {
  id: string;
  name: string;
  avatar: { key: string; purpose: string } | null;
};

export type EpisodeComment = {
  id: string;
  episodeId: string;
  profileId: string;
  parentId: string | null;
  replyToId: string | null;
  text: string;
  spoiler: boolean;
  createdAt: string;
  updatedAt: string;
  profile: CommentProfile;
};

export type TopLevelComment = EpisodeComment & {
  replyCount: number;
};

export type ReplyComment = EpisodeComment & {
  replyTo: { id: string; profileName: string } | null;
};

type CommentsPage<T> = {
  items: T[];
  nextCursor: string | null;
};

async function fetchEpisodeComments(
  episodeId: string,
  cursor?: string,
): Promise<CommentsPage<TopLevelComment>> {
  const qs = new URLSearchParams();
  if (cursor) qs.set("cursor", cursor);
  qs.set("limit", "10");
  const query = qs.toString();

  const response = await fetch(
    `/api/proxy/episodes/${episodeId}/comments${query ? `?${query}` : ""}`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch comments: ${response.status}`);
  }
  return response.json();
}

async function fetchCommentReplies(
  episodeId: string,
  parentId: string,
  cursor?: string,
): Promise<CommentsPage<ReplyComment>> {
  const qs = new URLSearchParams();
  qs.set("parentId", parentId);
  if (cursor) qs.set("cursor", cursor);
  qs.set("limit", "10");

  const response = await fetch(
    `/api/proxy/episodes/${episodeId}/comments?${qs.toString()}`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch replies: ${response.status}`);
  }
  return response.json();
}

export const buildFetchEpisodeCommentsQueryOptions = (episodeId: string) =>
  infiniteQueryOptions({
    queryKey: ["episodes", episodeId, "comments"],
    queryFn: ({ pageParam }) => fetchEpisodeComments(episodeId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

export const buildFetchCommentRepliesQueryOptions = (
  episodeId: string,
  parentId: string,
) =>
  infiniteQueryOptions({
    queryKey: ["episodes", episodeId, "comments", parentId, "replies"],
    queryFn: ({ pageParam }) =>
      fetchCommentReplies(episodeId, parentId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
