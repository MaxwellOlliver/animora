export type VideoQuality = '360p' | '720p' | '1080p';

export interface VideoUploadedEvent {
  videoId: string;
  episodeId: string;
  rawObjectKey: string;
  qualities: VideoQuality[];
}

export interface VideoProcessedEvent {
  videoId: string;
  episodeId: string;
  status: 'ready' | 'failed';
  masterPlaylistKey?: string;
  error?: string;
}
