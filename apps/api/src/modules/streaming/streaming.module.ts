import { Module } from '@nestjs/common';

import { EpisodesModule } from '../admin/episodes/episodes.module';
import { VideosModule } from '../admin/videos/videos.module';
import { StreamingController } from './streaming.controller';
import { GetWatchEpisodeUseCase } from './use-cases/get-watch-episode.use-case';

@Module({
  imports: [EpisodesModule, VideosModule],
  controllers: [StreamingController],
  providers: [GetWatchEpisodeUseCase],
})
export class StreamingModule {}
