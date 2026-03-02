import { Effect, Schema } from 'effect';
import { EVENTS, QUEUES, type VideoProcessedEvent } from '@animora/contracts';
import { FfmpegService } from '../ffmpeg.service';
import { PublisherService } from '../../infra/rabbitmq/rabbitmq.publisher';
import { updateVideoStatus } from '../use-cases/update-video-status.use-case';
import { InvalidEventError } from '../../errors/invalid-event.error';

const VideoQualitySchema = Schema.Literal('360p', '720p', '1080p');

const VideoUploadedEventSchema = Schema.Struct({
  videoId: Schema.String,
  episodeId: Schema.String,
  rawObjectKey: Schema.NonEmptyString,
  qualities: Schema.Array(VideoQualitySchema),
});

export const handleVideoUploaded = (data: unknown) =>
  Effect.gen(function* () {
    const event = yield* Schema.decodeUnknown(VideoUploadedEventSchema)(
      data,
    ).pipe(Effect.mapError((cause) => new InvalidEventError({ cause })));

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
        Effect.catchTag('TranscodeError', (error) =>
          Effect.gen(function* () {
            yield* Effect.logError(
              `Transcode failed for video ${event.videoId}: ${String(error.cause)}`,
            );
            return { status: 'failed' as const, masterPlaylistKey: undefined };
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
