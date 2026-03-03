import { Context, Effect, Layer } from 'effect';
import { S3Client, S3ClientLive } from './s3.layer';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { AppConfig } from '../config/config.layer';
import { S3Error } from '../../errors/s3.error';
import type { Readable } from 'node:stream';

interface IS3Service {
  getObject: (key: string) => Effect.Effect<Readable, S3Error>;
}

export class S3Service extends Context.Tag('S3Service')<
  S3Service,
  IS3Service
>() {}

export const S3ServiceLive = Layer.effect(
  S3Service,
  Effect.gen(function* () {
    const client = yield* S3Client;
    const config = yield* AppConfig;

    return {
      getObject: (key: string) =>
        Effect.gen(function* () {
          const res = yield* Effect.tryPromise({
            try: () =>
              client.send(
                new GetObjectCommand({
                  Bucket: config.s3Bucket,
                  Key: key,
                }),
              ),
            catch: (cause) => new S3Error({ cause }),
          });

          if (!res.Body) {
            return yield* Effect.fail(
              new S3Error({ cause: 'No body found in S3 response' }),
            );
          }

          return res.Body as Readable;
        }),
    };
  }),
).pipe(Layer.provide(S3ClientLive));
