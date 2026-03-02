import { Effect } from 'effect';
import {
  EVENTS,
  QUEUES,
  type VideoUploadedEvent,
  type VideoProcessedEvent,
} from '@animora/contracts';
import { FfmpegService } from '../ffmpeg.service';
import { PublisherService } from '../../infra/rabbitmq/rabbitmq.publisher';
import { updateVideoStatus } from '../use-cases/update-video-status.use-case';

export const handleVideoUploaded = (data: unknown) =>
  Effect.gen(function* () {
    const event = data as VideoUploadedEvent;
    const ffmpeg = yield* FfmpegService;
    const publisher = yield* PublisherService;

    yield* Effect.log(`Processing video ${event.videoId}`);

    const transcodeResult = yield* ffmpeg
      .transcode({
        rawObjectKey: event.rawObjectKey,
        qualities: event.qualities,
      })
      .pipe(
        Effect.map((output) => ({
          status: 'ready' as const,
          masterPlaylistKey: output.masterPlaylistKey,
        })),
        Effect.catchAll(() =>
          Effect.succeed({
            status: 'failed' as const,
            masterPlaylistKey: undefined,
          }),
        ),
      );

    const result: VideoProcessedEvent = {
      videoId: event.videoId,
      episodeId: event.episodeId,
      ...transcodeResult,
    };

    yield* updateVideoStatus(result);
    yield* publisher.publish(
      QUEUES.VIDEO_PROCESSED,
      EVENTS.VIDEO_PROCESSED,
      result,
    );
    yield* Effect.log(
      `Video processed ${event.videoId} with status ${result.status}`,
    );
  });
