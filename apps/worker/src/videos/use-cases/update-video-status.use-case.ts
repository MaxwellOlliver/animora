import { Effect } from 'effect';

import { VideosRepository } from '../videos.repository';

export const updateVideoStatus = (
  videoId: string,
  status: 'ready' | 'failed',
  masterPlaylistKey?: string,
) =>
  Effect.gen(function* () {
    const repo = yield* VideosRepository;
    yield* repo.updateStatus(videoId, status, masterPlaylistKey);
  });
