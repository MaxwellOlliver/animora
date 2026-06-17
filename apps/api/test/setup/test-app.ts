import fastifyMultipart from '@fastify/multipart';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';

import { AppModule } from '@/app.module';
import { S3Service } from '@/infra/s3/s3.service';

export async function createTestApp(
  databaseUrl: string,
  options?: { redisUrl?: string },
): Promise<NestFastifyApplication> {
  // Set env vars before module compilation
  process.env.DATABASE_URL = databaseUrl;
  process.env.REDIS_URL =
    options?.redisUrl ?? process.env.REDIS_URL ?? 'redis://localhost:6379';
  process.env.RABBITMQ_URL =
    process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672';
  process.env.S3_PUBLIC_URL =
    process.env.S3_PUBLIC_URL ?? 'http://localhost:9000/animora-test';
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.JWT_EXPIRATION = '15m';
  process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
  process.env.JWT_REFRESH_EXPIRATION = '7d';
  process.env.GOOGLE_CLIENT_ID = 'fake-google-client-id';
  process.env.GOOGLE_CLIENT_SECRET = 'fake-google-client-secret';
  process.env.GOOGLE_CALLBACK_URL =
    'http://localhost:3000/auth/google/callback';
  process.env.S3_ENDPOINT = 'http://localhost:9000';
  process.env.S3_REGION = 'us-east-1';
  process.env.S3_BUCKET = 'animora-test';
  process.env.S3_ACCESS_KEY = 'minioadmin';
  process.env.S3_SECRET_KEY = 'minioadmin';

  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(S3Service)
    .useValue({
      upload: (
        folder: string,
        _buffer: Buffer,
        _mimeType: string,
        ext: string,
      ) => Promise.resolve(`${folder}/test-upload.${ext}`),
      putObject: () => Promise.resolve(),
      putStream: () => Promise.resolve(),
      composeObjects: () => Promise.resolve(),
      delete: () => Promise.resolve(),
      deleteMany: () => Promise.resolve(),
      getPublicUrl: (key: string) =>
        `http://localhost:9000/animora-test/${key}`,
      getMediaUrl: (purpose: string, filename: string) =>
        `http://localhost:9000/animora-test/${purpose}/${filename}`,
    })
    .compile();

  const app = moduleFixture.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter(),
  );

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app
    .getHttpAdapter()
    .getInstance()
    .register(fastifyMultipart, { limits: { fileSize: 10_485_760 } });

  await app.init();
  await app.getHttpAdapter().getInstance().ready();

  return app;
}
