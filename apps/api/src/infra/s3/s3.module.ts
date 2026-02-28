import { Global, Module } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { S3Service } from './s3.service';

export const S3_CLIENT = Symbol('S3_CLIENT');

@Global()
@Module({
  providers: [
    {
      provide: S3_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return new S3Client({
          endpoint: config.getOrThrow<string>('S3_ENDPOINT'),
          region: config.getOrThrow<string>('S3_REGION'),
          credentials: {
            accessKeyId: config.getOrThrow<string>('S3_ACCESS_KEY'),
            secretAccessKey: config.getOrThrow<string>('S3_SECRET_KEY'),
          },
          forcePathStyle: true,
        });
      },
    },
    S3Service,
  ],
  exports: [S3Service],
})
export class S3Module {}
