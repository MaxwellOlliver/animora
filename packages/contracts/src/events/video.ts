export type VideoOwnerType = 'episode' | 'trailer';

export type VideoQuality = '360p' | '720p' | '1080p';

export interface VideoTranscodeEvent {
  videoId: string;
  ownerType: VideoOwnerType;
  ownerId: string;
  rawObjectKey: string;
  qualities: VideoQuality[];
}

export interface VideoTranscodedEvent {
  videoId: string;
  ownerType: VideoOwnerType;
  ownerId: string;
  masterPlaylistKey: string;
}

export interface VideoTranscodeFailedEvent {
  videoId: string;
  ownerType: VideoOwnerType;
  ownerId: string;
  reason: string;
}
