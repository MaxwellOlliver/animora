import { Context, Effect, Layer, Schema } from 'effect';

const EnvSchema = Schema.Struct({
  DATABASE_URL: Schema.NonEmptyString,
  RABBITMQ_URL: Schema.NonEmptyString,
  WORKER_CONCURRENCY: Schema.optionalWith(Schema.NumberFromString, {
    default: () => 1,
  }),
  S3_ACCESS_KEY: Schema.NonEmptyString,
  S3_SECRET_KEY: Schema.NonEmptyString,
  S3_REGION: Schema.NonEmptyString,
  S3_BUCKET: Schema.NonEmptyString,
  S3_ENDPOINT: Schema.NonEmptyString,
});

type Config = {
  databaseUrl: string;
  rabbitmqUrl: string;
  workerConcurrency: number;
  s3AccessKey: string;
  s3SecretKey: string;
  s3Region: string;
  s3Bucket: string;
  s3Endpoint: string;
};

export class AppConfig extends Context.Tag('AppConfig')<AppConfig, Config>() {}

export const ConfigLive = Layer.effect(
  AppConfig,
  Schema.decodeUnknown(EnvSchema)(process.env).pipe(
    Effect.map((env) => ({
      databaseUrl: env.DATABASE_URL,
      rabbitmqUrl: env.RABBITMQ_URL,
      workerConcurrency: env.WORKER_CONCURRENCY,
      s3AccessKey: env.S3_ACCESS_KEY,
      s3SecretKey: env.S3_SECRET_KEY,
      s3Region: env.S3_REGION,
      s3Bucket: env.S3_BUCKET,
      s3Endpoint: env.S3_ENDPOINT,
    })),
    Effect.orDie,
  ),
);
