import { Module } from '@nestjs/common';
import { UploadsAdminController } from './uploads-admin.controller';
import { UploadsRepository } from './uploads.repository';
import { VideosModule } from '../videos/videos.module';
import { InitUploadUseCase } from './use-cases/init-upload.use-case';
import { UploadChunkUseCase } from './use-cases/upload-chunk.use-case';
import { CompleteUploadUseCase } from './use-cases/complete-upload.use-case';

@Module({
  imports: [VideosModule],
  controllers: [UploadsAdminController],
  providers: [UploadsRepository, InitUploadUseCase, UploadChunkUseCase, CompleteUploadUseCase],
  exports: [UploadsRepository],
})
export class UploadsModule {}
