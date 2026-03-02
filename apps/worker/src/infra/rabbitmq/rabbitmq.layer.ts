import { Context, Effect, Layer } from 'effect';
import * as amqplib from 'amqplib';
import { AppConfig } from '../config/config.layer';

export class AmqpConnection extends Context.Tag('AmqpConnection')<
  AmqpConnection,
  amqplib.ChannelModel
>() {}

export class AmqpChannel extends Context.Tag('AmqpChannel')<
  AmqpChannel,
  amqplib.Channel
>() {}

const ConnectionLive = Layer.scoped(
  AmqpConnection,
  Effect.acquireRelease(
    Effect.gen(function* () {
      const { rabbitmqUrl } = yield* AppConfig;
      const conn = yield* Effect.tryPromise(() => amqplib.connect(rabbitmqUrl));
      yield* Effect.log('RabbitMQ connection acquired');
      return conn;
    }),
    (conn) =>
      Effect.gen(function* () {
        yield* Effect.promise(() => conn.close()).pipe(Effect.orDie);
        yield* Effect.log('RabbitMQ connection released');
      }),
  ),
);

const ChannelLive = Layer.scoped(
  AmqpChannel,
  Effect.gen(function* () {
    const conn = yield* AmqpConnection;
    return yield* Effect.acquireRelease(
      Effect.gen(function* () {
        const ch = yield* Effect.tryPromise<amqplib.Channel>(() =>
          conn.createChannel(),
        );
        yield* Effect.log('RabbitMQ channel acquired');
        return ch;
      }),
      (ch) =>
        Effect.gen(function* () {
          yield* Effect.promise(() => ch.close()).pipe(Effect.orDie);
          yield* Effect.log('RabbitMQ channel released');
        }),
    );
  }),
).pipe(Layer.provide(ConnectionLive));

export const AmqpChannelLive = ChannelLive;
