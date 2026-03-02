import { Effect } from 'effect';
import { EVENTS, QUEUES } from '@animora/contracts';
import { AppConfig } from './infra/config/config.layer';
import { ConsumerService } from './infra/rabbitmq/rabbitmq.consumer';
import { createRouter } from './infra/rabbitmq/rabbitmq.router';
import { handleVideoUploaded } from './videos/handlers/video-uploaded.handler';

const router = createRouter({
  [EVENTS.VIDEO_UPLOADED]: handleVideoUploaded,
});

export const program = Effect.scoped(
  Effect.gen(function* () {
    const { workerConcurrency } = yield* AppConfig;
    const consumer = yield* ConsumerService;
    yield* Effect.log('Worker started');
    yield* consumer.consume(QUEUES.VIDEO_PROCESSING, router, workerConcurrency);
  }),
);
