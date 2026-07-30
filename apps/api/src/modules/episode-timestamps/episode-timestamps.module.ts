import { Module } from '@nestjs/common';

import { EpisodesModule } from '../admin/episodes/episodes.module';
import { EpisodeTimestampsRepository } from './episode-timestamps.repository';
import { EpisodeTimestampsAdminController } from './episode-timestamps-admin.controller';
import { GetEpisodeTimestampsUseCase } from './use-cases/get-episode-timestamps.use-case';
import { SetEpisodeTimestampsUseCase } from './use-cases/set-episode-timestamps.use-case';

@Module({
  imports: [EpisodesModule],
  controllers: [EpisodeTimestampsAdminController],
  providers: [
    EpisodeTimestampsRepository,
    GetEpisodeTimestampsUseCase,
    SetEpisodeTimestampsUseCase,
  ],
  exports: [EpisodeTimestampsRepository],
})
export class EpisodeTimestampsModule {}
