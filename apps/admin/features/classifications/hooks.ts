"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContentClassification,
  type CreateContentClassificationInput,
  fetchContentClassificationById,
  fetchContentClassifications,
  type UpdateContentClassificationInput,
  updateContentClassification,
  uploadContentClassificationIcon,
} from "./api";

export function useContentClassificationsList() {
  return useQuery({
    queryKey: ["content-classifications"],
    queryFn: fetchContentClassifications,
  });
}

export function useContentClassificationById(id: string) {
  return useQuery({
    queryKey: ["content-classifications", id],
    queryFn: () => fetchContentClassificationById(id),
    enabled: !!id,
  });
}

export function useCreateContentClassification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateContentClassificationInput) =>
      createContentClassification(input),
    onSuccess: async (created) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["content-classifications"] }),
        queryClient.invalidateQueries({
          queryKey: ["content-classifications", created.id],
        }),
      ]);
    },
  });
}

export function useUpdateContentClassification(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateContentClassificationInput) =>
      updateContentClassification(id, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["content-classifications"] }),
        queryClient.invalidateQueries({ queryKey: ["content-classifications", id] }),
      ]);
    },
  });
}

export function useUploadContentClassificationIcon(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadContentClassificationIcon(id, file),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["content-classifications"] }),
        queryClient.invalidateQueries({ queryKey: ["content-classifications", id] }),
      ]);
    },
  });
}
