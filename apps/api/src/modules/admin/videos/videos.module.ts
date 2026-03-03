import { Module } from '@nestjs/common';

import { EpisodesModule } from '../episodes/episodes.module';
import { CreateVideoUseCase } from './use-cases/create-video.use-case';
import { DeleteVideoUseCase } from './use-cases/delete-video.use-case';
import { GetVideoUseCase } from './use-cases/get-video.use-case';
import { HandleVideoProcessedUseCase } from './use-cases/handle-video-processed.use-case';
import { VideoEventsService } from './video-events.service';
import { VideoProcessedConsumer } from './video-processed.consumer';
import { VideosRepository } from './videos.repository';
import { VideosAdminController } from './videos-admin.controller';

@Module({
  imports: [EpisodesModule],
  controllers: [VideosAdminController, VideoProcessedConsumer],
  providers: [
    VideosRepository,
    VideoEventsService,
    CreateVideoUseCase,
    DeleteVideoUseCase,
    GetVideoUseCase,
    HandleVideoProcessedUseCase,
  ],
  exports: [VideosRepository, CreateVideoUseCase, VideoEventsService],
})
export class VideosModule {}
