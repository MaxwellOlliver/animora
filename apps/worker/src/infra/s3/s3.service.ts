import type { Readable } from 'node:stream';

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { Context, Effect, Layer } from 'effect';

import { S3Error } from '../../errors/s3.error';
import { AppConfig } from '../config/config.layer';
import { S3Client, S3ClientLive } from './s3.layer';

export class S3Service extends Context.Tag('S3Service')<
  S3Service,
  {
    getObject(key: string): Effect.Effect<Readable, S3Error>;
    putObject(
      key: string,
      body: Readable | Buffer,
      contentType?: string,
      contentLength?: number,
    ): Effect.Effect<void, S3Error>;
    deleteObject(key: string): Effect.Effect<void, S3Error>;
  }
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

      putObject: (
        key: string,
        body: Readable | Buffer,
        contentType?: string,
        contentLength?: number,
      ) =>
        Effect.tryPromise({
          try: () =>
            client.send(
              new PutObjectCommand({
                Bucket: config.s3Bucket,
                Key: key,
                Body: body,
                ...(contentType ? { ContentType: contentType } : {}),
                ...(contentLength !== undefined
                  ? { ContentLength: contentLength }
                  : {}),
              }),
            ),
          catch: (cause) => new S3Error({ cause }),
        }).pipe(Effect.asVoid),

      deleteObject: (key: string) =>
        Effect.tryPromise({
          try: () =>
            client.send(
              new DeleteObjectCommand({
                Bucket: config.s3Bucket,
                Key: key,
              }),
            ),
          catch: (cause) => new S3Error({ cause }),
        }).pipe(Effect.asVoid),
    };
  }),
).pipe(Layer.provide(S3ClientLive));
