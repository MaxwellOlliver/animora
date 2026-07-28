import { buildStorageKey, type MediaPurpose } from "@animora/contracts";

export function getMediaImageUrl(purpose: string, key: string): string {
  const storageKey = buildStorageKey(purpose as MediaPurpose, key);
  return `/api/image/${storageKey}`;
}
