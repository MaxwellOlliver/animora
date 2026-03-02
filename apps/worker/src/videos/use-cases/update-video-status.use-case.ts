import { Effect } from 'effect';
import type { VideoProcessedEvent } from '@animora/contracts';
import { VideosRepository } from '../videos.repository';

export const updateVideoStatus = (event: VideoProcessedEvent) =>
  Effect.gen(function* () {
    const repo = yield* VideosRepository;
    yield* repo.updateStatus(
      event.videoId,
      event.status,
      event.masterPlaylistKey,
    );
  });
