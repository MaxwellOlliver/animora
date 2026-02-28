import { Test } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyMultipart from '@fastify/multipart';
import { AppModule } from '@/app.module';

export async function createTestApp(
  databaseUrl: string,
): Promise<NestFastifyApplication> {
  // Set env vars before module compilation
  process.env.DATABASE_URL = databaseUrl;
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
  }).compile();

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
