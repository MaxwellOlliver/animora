export const QUEUES = {
  VIDEO_TRANSCODE: 'video.transcode', // Worker consumes — transcode commands
  VIDEO_EVENTS: 'video.events', // API consumes — worker lifecycle events
} as const;

export const EVENTS = {
  VIDEO_TRANSCODE: 'video.transcode',
  VIDEO_TRANSCODED: 'video.transcoded',
  VIDEO_TRANSCODE_FAILED: 'video.transcode_failed',
} as const;
