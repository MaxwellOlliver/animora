import { buildStorageKey, type MediaPurpose } from "@animora/contracts";

const bucket = process.env.NEXT_PUBLIC_S3_BUCKET ?? "animora";

export function getMediaImageUrl(purpose: string, key: string): string {
  const storageKey = buildStorageKey(purpose as MediaPurpose, key);
  return `/api/image/${bucket}/${storageKey}`;
}
