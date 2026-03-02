import { Context, Effect, Layer, Schema } from 'effect';

const EnvSchema = Schema.Struct({
  DATABASE_URL: Schema.NonEmptyString,
  RABBITMQ_URL: Schema.NonEmptyString,
  WORKER_CONCURRENCY: Schema.optionalWith(Schema.NumberFromString, {
    default: () => 1,
  }),
});

type Config = {
  databaseUrl: string;
  rabbitmqUrl: string;
  workerConcurrency: number;
};

export class AppConfig extends Context.Tag('AppConfig')<AppConfig, Config>() {}

export const ConfigLive = Layer.effect(
  AppConfig,
  Schema.decodeUnknown(EnvSchema)(process.env).pipe(
    Effect.map((env) => ({
      databaseUrl: env.DATABASE_URL,
      rabbitmqUrl: env.RABBITMQ_URL,
      workerConcurrency: env.WORKER_CONCURRENCY,
    })),
    Effect.orDie,
  ),
);
