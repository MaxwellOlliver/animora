import { createWriteStream } from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { pipeline } from 'node:stream/promises';

import { EVENTS, QUEUES, type VideoProcessedEvent } from '@animora/contracts';
import { Effect, Schema } from 'effect';

import { InvalidEventError } from '../../errors/invalid-event.error';
import { PublisherService } from '../../infra/rabbitmq/rabbitmq.publisher';
import { S3Service } from '../../infra/s3/s3.service';
import { processVideo } from '../use-cases/process-video.use-case';
import { updateVideoStatus } from '../use-cases/update-video-status.use-case';

const VideoQualitySchema = Schema.Literal('360p', '720p', '1080p');

const VideoOwnerTypeSchema = Schema.Literal('episode', 'trailer');

const VideoUploadedEventSchema = Schema.Struct({
  videoId: Schema.String,
  ownerType: VideoOwnerTypeSchema,
  ownerId: Schema.String,
  rawObjectKey: Schema.NonEmptyString,
  qualities: Schema.Array(VideoQualitySchema),
});

export const handleVideoUploaded = (data: unknown) =>
  Effect.gen(function* () {
    const event = yield* Schema.decodeUnknown(VideoUploadedEventSchema)(
      data,
    ).pipe(Effect.mapError((cause) => new InvalidEventError({ cause })));

    const publisher = yield* PublisherService;
    const s3Service = yield* S3Service;

    yield* Effect.log(`Processing video ${event.videoId}`);

    const outputDir = join('tmp', event.videoId);
    yield* Effect.promise(() => mkdir(outputDir, { recursive: true }));

    const body = yield* s3Service.getObject(event.rawObjectKey);

    yield* Effect.log(
      `Fetched video ${event.videoId} from S3 with key ${event.rawObjectKey}`,
    );

    const destPath = join(outputDir, 'original.mp4');
    yield* Effect.promise(() => pipeline(body, createWriteStream(destPath)));

    const cleanup = Effect.promise(() =>
      rm(outputDir, { recursive: true, force: true }),
    ).pipe(Effect.ignore);

    const transcodeResult = yield* processVideo({
      videoId: event.videoId,
      inputPath: destPath,
      outputDir,
      qualities: event.qualities,
    }).pipe(
      Effect.tap(() => s3Service.deleteObject(event.rawObjectKey)),
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
      Effect.catchTag('S3Error', (error) =>
        Effect.gen(function* () {
          yield* Effect.logError(
            `Upload failed for video ${event.videoId}: ${String(error.cause)}`,
          );
          return { status: 'failed' as const, masterPlaylistKey: undefined };
        }),
      ),
      Effect.ensuring(cleanup),
    );

    const result: VideoProcessedEvent = {
      videoId: event.videoId,
      ownerType: event.ownerType,
      ownerId: event.ownerId,
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
