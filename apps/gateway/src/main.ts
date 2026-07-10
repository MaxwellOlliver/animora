import fastifyCors from '@fastify/cors';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { FastifyRedisIoAdapter } from './common/adapters/fastify-redis-io.adapter';
import { GatewayExceptionFilter } from './common/filters/gateway-exception.filter';
import { REDIS_CLIENT, type RedisClient } from './infra/redis/redis.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const config = app.get(ConfigService);

  const fastify = app.getHttpAdapter().getInstance();
  await fastify.register(fastifyCors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  const redis = app.get<RedisClient>(REDIS_CLIENT);
  const ioAdapter = new FastifyRedisIoAdapter(app, redis);
  app.useWebSocketAdapter(ioAdapter);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new GatewayExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Animora Gateway')
    .setDescription('Animora realtime gateway API')
    .setVersion('0.1')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(config.getOrThrow<string>('GATEWAY_PORT'), '0.0.0.0');
  const fastifyInstance = app.getHttpAdapter().getInstance() as {
    server: unknown;
  };
  ioAdapter.attach(fastifyInstance.server);
}
void bootstrap();
