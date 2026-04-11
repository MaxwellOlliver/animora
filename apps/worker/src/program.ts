import { EVENTS, QUEUES } from '@animora/contracts';
import { Effect } from 'effect';

import { AppConfig } from './infra/config/config.layer';
import { ConsumerService } from './infra/rabbitmq/rabbitmq.consumer';
import { createRouter } from './infra/rabbitmq/rabbitmq.router';
import { handleVideoTranscode } from './videos/handlers/video-transcode.handler';

const router = createRouter({
  [EVENTS.VIDEO_TRANSCODE]: handleVideoTranscode,
});

export const program = Effect.scoped(
  Effect.gen(function* () {
    const { workerConcurrency } = yield* AppConfig;
    const consumer = yield* ConsumerService;
    yield* Effect.log('Worker started');
    yield* consumer.consume(QUEUES.VIDEO_TRANSCODE, router, workerConcurrency);
  }),
);
