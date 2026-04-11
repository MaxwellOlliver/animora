"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createAvatar,
  type CreateAvatarInput,
  deleteAvatar,
  fetchAvatarById,
  fetchAvatars,
  updateAvatar,
  type UpdateAvatarInput,
  uploadAvatarPicture,
} from "./api";

export function useAvatarsList() {
  return useQuery({
    queryKey: ["avatars"],
    queryFn: () => fetchAvatars(),
  });
}

export function useAvatarById(id: string) {
  return useQuery({
    queryKey: ["avatars", id],
    queryFn: () => fetchAvatarById(id),
    enabled: !!id,
  });
}

export function useCreateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAvatarInput) => createAvatar(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["avatars"] });
    },
  });
}

export function useUpdateAvatar(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateAvatarInput) => updateAvatar(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["avatars"] });
    },
  });
}

export function useDeleteAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAvatar(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["avatars"] });
    },
  });
}

export function useUploadAvatarPicture(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadAvatarPicture(id, file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["avatars"] });
    },
  });
}
