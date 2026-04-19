import { QUEUES } from '@animora/contracts';
import fastifyCors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { FastifyIoAdapter } from './common/adapters/fastify-io.adapter';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const config = app.get(ConfigService);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [config.getOrThrow<string>('RABBITMQ_URL')],
      queue: QUEUES.VIDEO_EVENTS,
      queueOptions: { durable: true },
      noAck: false,
    },
  });

  const fastify = app.getHttpAdapter().getInstance();
  await fastify.register(fastifyCors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  await fastify.register(fastifyMultipart, {
    limits: { fileSize: 10_485_760 },
  }); // 10 MB

  const ioAdapter = new FastifyIoAdapter(app);
  app.useWebSocketAdapter(ioAdapter);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Animora API')
    .setDescription('Animora REST API')
    .setVersion('0.1')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  const fastifyInstance = app.getHttpAdapter().getInstance() as {
    server: unknown;
  };
  ioAdapter.attach(fastifyInstance.server);
}
void bootstrap();
