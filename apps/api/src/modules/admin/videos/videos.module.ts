import { Module } from '@nestjs/common';

import { CreateVideoUseCase } from './use-cases/create-video.use-case';
import { DeleteVideoUseCase } from './use-cases/delete-video.use-case';
import { GetVideoUseCase } from './use-cases/get-video.use-case';
import { GetVideoByOwnerUseCase } from './use-cases/get-video-by-owner.use-case';
import { HandleVideoTranscodedUseCase } from './use-cases/handle-video-transcoded.use-case';
import { HandleVideoTranscodeFailedUseCase } from './use-cases/handle-video-transcode-failed.use-case';
import { VideoEventsService } from './video-events.service';
import { VideoEventsConsumer } from './video-events.consumer';
import { VideosRepository } from './videos.repository';
import { VideosAdminController } from './videos-admin.controller';

@Module({
  controllers: [VideosAdminController, VideoEventsConsumer],
  providers: [
    VideosRepository,
    VideoEventsService,
    CreateVideoUseCase,
    DeleteVideoUseCase,
    GetVideoByOwnerUseCase,
    GetVideoUseCase,
    HandleVideoTranscodedUseCase,
    HandleVideoTranscodeFailedUseCase,
  ],
  exports: [
    VideosRepository,
    CreateVideoUseCase,
    GetVideoByOwnerUseCase,
    VideoEventsService,
  ],
})
export class VideosModule {}
