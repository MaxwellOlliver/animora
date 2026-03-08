"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteVideo, fetchVideoByEpisodeId } from "./api";

export function useVideoByEpisodeId(episodeId: string) {
  return useQuery({
    queryKey: ["video", episodeId],
    queryFn: () => fetchVideoByEpisodeId(episodeId),
    enabled: !!episodeId,
    retry: (failureCount, error) => {
      // Don't retry 404s — episode just doesn't have a video yet
      if (error instanceof Error && error.message.includes("404")) return false;
      return failureCount < 3;
    },
  });
}

export function useDeleteVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteVideo(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["video"] });
    },
  });
}
