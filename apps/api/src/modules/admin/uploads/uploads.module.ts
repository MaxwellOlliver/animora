import { Module } from '@nestjs/common';

import { VideosModule } from '../videos/videos.module';
import { EpisodeUploadsAdminController } from './controllers/episode-uploads-admin.controller';
import { TrailerUploadsAdminController } from './controllers/trailer-uploads-admin.controller';
import { UploadsAdminController } from './controllers/uploads-admin.controller';
import { UploadsRepository } from './repositories/uploads.repository';
import { CompleteUploadUseCase } from './use-cases/complete-upload.use-case';
import { InitUploadUseCase } from './use-cases/init-upload.use-case';
import { UploadChunkUseCase } from './use-cases/upload-chunk.use-case';

@Module({
  imports: [VideosModule],
  controllers: [
    UploadsAdminController,
    EpisodeUploadsAdminController,
    TrailerUploadsAdminController,
  ],
  providers: [
    UploadsRepository,
    InitUploadUseCase,
    UploadChunkUseCase,
    CompleteUploadUseCase,
  ],
  exports: [UploadsRepository],
})
export class UploadsModule {}
