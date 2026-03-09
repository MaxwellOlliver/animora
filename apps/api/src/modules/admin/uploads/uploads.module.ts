import { Module } from '@nestjs/common';

import { VideosModule } from '../videos/videos.module';
import { UploadsRepository } from './repositories/uploads.repository';
import { UploadsAdminController } from './uploads-admin.controller';
import { CompleteUploadUseCase } from './use-cases/complete-upload.use-case';
import { InitUploadUseCase } from './use-cases/init-upload.use-case';
import { UploadChunkUseCase } from './use-cases/upload-chunk.use-case';

@Module({
  imports: [VideosModule],
  controllers: [UploadsAdminController],
  providers: [
    UploadsRepository,
    InitUploadUseCase,
    UploadChunkUseCase,
    CompleteUploadUseCase,
  ],
  exports: [UploadsRepository],
})
export class UploadsModule {}
