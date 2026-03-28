import { buildStorageKey, MediaPurpose } from "@animora/contracts";
import { env } from "@/lib/env";

export const buildMediaUrl = (purpose: MediaPurpose, filename: string) => {
  return `${env.NEXT_PUBLIC_S3_ENDPOINT}/${buildStorageKey(purpose, filename)}`;
};
