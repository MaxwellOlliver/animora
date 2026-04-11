"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deleteVideo, fetchVideoByOwner } from "./api";
import type { VideoOwnerType } from "./types";

export function useVideoByOwner(ownerType: VideoOwnerType, ownerId: string) {
  return useQuery({
    queryKey: ["video", ownerType, ownerId],
    queryFn: () => fetchVideoByOwner(ownerType, ownerId),
    enabled: !!ownerId,
    retry: (failureCount, error) => {
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
