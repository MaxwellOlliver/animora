import { Module } from '@nestjs/common';

import { EpisodesModule } from '../admin/episodes/episodes.module';
import { VideosModule } from '../admin/videos/videos.module';
import { EpisodeRatingsModule } from '../episode-ratings/episode-ratings.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { StreamingController } from './streaming.controller';
import { GetWatchEpisodeUseCase } from './use-cases/get-watch-episode.use-case';

@Module({
  imports: [EpisodesModule, VideosModule, EpisodeRatingsModule, ProfilesModule],
  controllers: [StreamingController],
  providers: [GetWatchEpisodeUseCase],
})
export class StreamingModule {}
