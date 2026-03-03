import * as amqplib from 'amqplib';
import { Context, Effect, Layer, Queue, Schema, Scope } from 'effect';

import { MessageParseError } from '../../errors/message-parse.error';
import { AmqpChannel } from './rabbitmq.layer';

const RabbitMqMessageSchema = Schema.Struct({
  pattern: Schema.String,
  data: Schema.Unknown,
});

export class ConsumerService extends Context.Tag('ConsumerService')<
  ConsumerService,
  {
    consume<E, R>(
      queueName: string,
      handler: (pattern: string, data: unknown) => Effect.Effect<void, E, R>,
      concurrency?: number,
    ): Effect.Effect<void, E | MessageParseError, R | Scope.Scope>;
  }
>() {}

export const ConsumerLive = Layer.effect(
  ConsumerService,
  Effect.gen(function* () {
    const channel = yield* AmqpChannel;
    return {
      consume: <E, R>(
        queueName: string,
        handler: (pattern: string, data: unknown) => Effect.Effect<void, E, R>,
        concurrency = 1,
      ) =>
        Effect.gen(function* () {
          const msgQueue = yield* Queue.unbounded<amqplib.Message>();

          yield* Effect.acquireRelease(
            Effect.tryPromise(async () => {
              await channel.assertQueue(queueName, { durable: true });
              await channel.prefetch(concurrency);
              return channel.consume(queueName, (msg) => {
                if (msg) Queue.unsafeOffer(msgQueue, msg);
              });
            }).pipe(Effect.orDie),
            ({ consumerTag }) =>
              Effect.promise(() => channel.cancel(consumerTag)).pipe(
                Effect.orDie,
              ),
          );

          const worker = Effect.forever(
            Effect.gen(function* () {
              const msg = yield* Queue.take(msgQueue);

              yield* Effect.gen(function* () {
                const { pattern, data } = yield* Effect.try(
                  () => JSON.parse(msg.content.toString()) as unknown,
                ).pipe(
                  Effect.flatMap(Schema.decodeUnknown(RabbitMqMessageSchema)),
                  Effect.mapError((cause) => new MessageParseError({ cause })),
                );

                yield* handler(pattern, data);
                yield* Effect.sync(() => channel.ack(msg));
              }).pipe(
                Effect.catchAll((error) =>
                  Effect.gen(function* () {
                    yield* Effect.logError(`Message nacked: ${String(error)}`);
                    yield* Effect.sync(() => channel.nack(msg, false, false));
                  }),
                ),
              );
            }),
          );

          yield* Effect.all(
            Array.from({ length: concurrency }, () => worker),
            { concurrency },
          );
        }),
    };
  }),
);
