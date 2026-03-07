import { buildStorageKey, type MediaPurpose } from "@animora/contracts";

export function getMediaImageUrl(purpose: string, key: string): string {
  const storageKey = buildStorageKey(purpose as MediaPurpose, key);
  return `/api/image/animora/${storageKey}`;
}

/** @deprecated Use getMediaImageUrl with media object instead */
export const getImageUrl = (key: string) => `/api/image/animora/${key}`;

/** @deprecated Use getMediaImageUrl with media object instead */
export const getObjectUrl = (key: string) =>
  new URL(`${process.env.NEXT_PUBLIC_URL}/api/image/animora/${key}`).toString();
