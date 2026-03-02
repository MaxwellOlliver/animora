import { Effect, Queue } from 'effect';
import * as amqplib from 'amqplib';
import { AmqpChannel } from './rabbitmq.layer';

export const consume = <E, R>(
  queueName: string,
  handler: (data: unknown) => Effect.Effect<void, E, R>,
) =>
  Effect.gen(function* () {
    const channel = yield* AmqpChannel;
    const msgQueue = yield* Queue.unbounded<amqplib.Message>();

    yield* Effect.acquireRelease(
      Effect.tryPromise(async () => {
        await channel.assertQueue(queueName, { durable: true });
        await channel.prefetch(1);

        return channel.consume(queueName, (msg) => {
          if (msg) Queue.unsafeOffer(msgQueue, msg);
        });
      }),
      ({ consumerTag }) =>
        Effect.promise(() => channel.cancel(consumerTag)).pipe(Effect.orDie),
    );

    yield* Effect.forever(
      Effect.gen(function* () {
        const msg = yield* Queue.take(msgQueue);
        yield* Effect.gen(function* () {
          const raw = yield* Effect.try(
            () => JSON.parse(msg.content.toString()) as { data?: unknown },
          );
          const data = raw?.data ?? raw;
          yield* handler(data);
          yield* Effect.sync(() => channel.ack(msg));
        }).pipe(
          Effect.catchAll((error) =>
            Effect.gen(function* () {
              const underlying =
                error instanceof Error && 'error' in error
                  ? String((error as Error & { error: unknown }).error)
                  : String(error);
              yield* Effect.log(`Message nacked: ${underlying}`);
              yield* Effect.sync(() => channel.nack(msg, false, false));
            }),
          ),
        );
      }),
    );
  });
