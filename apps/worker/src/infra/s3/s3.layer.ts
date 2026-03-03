import { S3Client as AWS_S3Client } from '@aws-sdk/client-s3';
import { Context, Effect, Layer } from 'effect';

import { AppConfig } from '../config/config.layer';

export class S3Client extends Context.Tag('S3Client')<
  S3Client,
  AWS_S3Client
>() {}

export const S3ClientLive = Layer.effect(
  S3Client,
  Effect.gen(function* () {
    const config = yield* AppConfig;

    return new AWS_S3Client({
      endpoint: config.s3Endpoint,
      region: config.s3Region,
      credentials: {
        accessKeyId: config.s3AccessKey,
        secretAccessKey: config.s3SecretKey,
      },
      forcePathStyle: true,
    });
  }),
);
