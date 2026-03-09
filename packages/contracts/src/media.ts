export const MEDIA_PURPOSE = {
  userAvatar: 'user-avatar',
  seriesBanner: 'series-banner',
  seriesLogo: 'series-logo',
  seriesTrailer: 'series-trailer',
  playlistCover: 'playlist-cover',
  episodeThumbnail: 'episode-thumbnail',
  classificationIcon: 'classification-icon',
  videoRaw: 'video-raw',
  videoHls: 'video-hls',
} as const;

export type MediaPurpose =
  (typeof MEDIA_PURPOSE)[keyof typeof MEDIA_PURPOSE];

const PURPOSE_TO_FOLDER: Record<MediaPurpose, string> = {
  'user-avatar': 'p/avatars',
  'series-banner': 'p/banners',
  'series-logo': 'p/logos',
  'series-trailer': 'p/trailers',
  'playlist-cover': 'p/covers',
  'episode-thumbnail': 'p/thumbnails',
  'classification-icon': 'p/classification-icons',
  'video-raw': 'videos/raw',
  'video-hls': 'videos/hls',
};

export function buildStorageKey(purpose: MediaPurpose, filename: string) {
  return `${PURPOSE_TO_FOLDER[purpose]}/${filename}`;
}

export function getStorageFolder(purpose: MediaPurpose) {
  return PURPOSE_TO_FOLDER[purpose];
}
