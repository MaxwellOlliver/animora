import { Effect } from 'effect';
import { QUEUES } from '@animora/contracts';
import { consume } from './infra/rabbitmq/rabbitmq.consumer';
import { handleVideoUploaded } from './videos/handlers/video-uploaded.handler';

export const program = Effect.scoped(
  Effect.gen(function* () {
    yield* Effect.log('Worker started');
    yield* consume(QUEUES.VIDEO_PROCESSING, handleVideoUploaded);
  }),
);
