import 'dotenv/config';
import { Effect, Exit, Fiber, Layer, Schedule, Duration } from 'effect';
import { mkdir } from 'node:fs/promises';
import { program } from './program';
import { ConfigLive } from './infra/config/config.layer';
import { DatabaseLive } from './infra/database/database.layer';
import { AmqpChannelLive } from './infra/rabbitmq/rabbitmq.layer';
import { ConsumerLive } from './infra/rabbitmq/rabbitmq.consumer';
import { PublisherLive } from './infra/rabbitmq/rabbitmq.publisher';
import { FfmpegLive } from './videos/ffmpeg.service';
import { VideosRepositoryLive } from './videos/videos.repository';
import { S3ServiceLive } from './infra/s3/s3.service';

const AppLayer = Layer.mergeAll(
  AmqpChannelLive,
  FfmpegLive,
  ConsumerLive.pipe(Layer.provide(AmqpChannelLive)),
  VideosRepositoryLive.pipe(Layer.provide(DatabaseLive)),
  PublisherLive.pipe(Layer.provide(AmqpChannelLive)),
  ConfigLive,
  S3ServiceLive,
).pipe(Layer.provide(ConfigLive));

const resilientProgram = Effect.zipRight(
  Effect.promise(() => mkdir('tmp', { recursive: true })),
  Effect.retry(
    program,
    Schedule.exponential(Duration.seconds(1)).pipe(
      Schedule.upTo(Duration.seconds(30)),
    ),
  ),
);

const fiber = Effect.runFork(Effect.provide(resilientProgram, AppLayer));

fiber.addObserver((exit) => {
  if (exit._tag === 'Failure' && !Exit.isInterrupted(exit)) {
    console.error('Worker crashed:', exit.cause);
    process.exit(1);
  }
});

const shutdown = () => Effect.runFork(Fiber.interrupt(fiber));
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
