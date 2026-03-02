import { Context, Effect, Layer } from 'effect';
import { AmqpChannel } from './rabbitmq.layer';

export class PublisherService extends Context.Tag('PublisherService')<
  PublisherService,
  {
    publish(
      queueName: string,
      pattern: string,
      data: unknown,
    ): Effect.Effect<void, unknown>;
  }
>() {}

export const PublisherLive = Layer.effect(
  PublisherService,
  Effect.gen(function* () {
    const channel = yield* AmqpChannel;
    return {
      publish: (queueName: string, pattern: string, data: unknown) =>
        Effect.tryPromise(() =>
          channel.assertQueue(queueName, { durable: true }).then(() => {
            channel.sendToQueue(
              queueName,
              Buffer.from(JSON.stringify({ pattern, data })),
              {
                persistent: true,
              },
            );
          }),
        ),
    };
  }),
);
