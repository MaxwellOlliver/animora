export type VideoOwnerType = 'episode' | 'trailer';

export type VideoQuality = '360p' | '720p' | '1080p';

export interface VideoUploadedEvent {
  videoId: string;
  ownerType: VideoOwnerType;
  ownerId: string;
  rawObjectKey: string;
  qualities: VideoQuality[];
}

export interface VideoProcessedEvent {
  videoId: string;
  ownerType: VideoOwnerType;
  ownerId: string;
  status: 'ready' | 'failed';
  masterPlaylistKey?: string;
  error?: string;
}
