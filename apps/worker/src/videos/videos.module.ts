import { Module } from '@nestjs/common';
import { VideosRepository } from './videos.repository';
import { UpdateVideoStatusUseCase } from './use-cases/update-video-status.use-case';

@Module({
  providers: [VideosRepository, UpdateVideoStatusUseCase],
  exports: [UpdateVideoStatusUseCase],
})
export class VideosModule {}
