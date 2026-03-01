export const QUEUES = {
  VIDEO_PROCESSING: 'video.processing', // Worker consumes — video.uploaded
  VIDEO_PROCESSED: 'video.processed',   // API consumes   — video.processed
} as const;

export const EVENTS = {
  VIDEO_UPLOADED: 'video.uploaded',
  VIDEO_PROCESSED: 'video.processed',
} as const;
