import { apiClient } from "@/lib/api-client";

import type { ContentClassification } from "./types";

export interface CreateContentClassificationInput {
  name: string;
  description?: string;
}

export interface UpdateContentClassificationInput {
  name: string;
  description?: string;
  active: boolean;
}

export async function fetchContentClassifications(): Promise<
  ContentClassification[]
> {
  return apiClient<ContentClassification[]>("/admin/content-classifications");
}

export async function fetchContentClassificationById(
  id: string,
): Promise<ContentClassification> {
  return apiClient<ContentClassification>(`/admin/content-classifications/${id}`);
}

export async function createContentClassification(
  input: CreateContentClassificationInput,
): Promise<ContentClassification> {
  return apiClient<ContentClassification>("/admin/content-classifications", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateContentClassification(
  id: string,
  input: UpdateContentClassificationInput,
): Promise<ContentClassification> {
  return apiClient<ContentClassification>(`/admin/content-classifications/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function uploadContentClassificationIcon(
  id: string,
  file: File,
): Promise<ContentClassification> {
  const formData = new FormData();
  formData.append("file", file);

  return apiClient<ContentClassification>(
    `/admin/content-classifications/${id}/icon`,
    {
      method: "POST",
      body: formData,
    },
  );
}
