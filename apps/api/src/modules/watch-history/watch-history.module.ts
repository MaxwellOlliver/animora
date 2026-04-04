import { Module } from '@nestjs/common';

import { EpisodesModule } from '../admin/episodes/episodes.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { GetContinueWatchingUseCase } from './use-cases/get-continue-watching.use-case';
import { GetEpisodeWatchHistoryUseCase } from './use-cases/get-episode-watch-history.use-case';
import { GetWatchHistoryUseCase } from './use-cases/get-watch-history.use-case';
import { UpsertWatchProgressUseCase } from './use-cases/upsert-watch-progress.use-case';
import { WatchHistoryController } from './watch-history.controller';
import { WatchHistoryRepository } from './watch-history.repository';

@Module({
  imports: [ProfilesModule, EpisodesModule],
  controllers: [WatchHistoryController],
  providers: [
    WatchHistoryRepository,
    UpsertWatchProgressUseCase,
    GetWatchHistoryUseCase,
    GetContinueWatchingUseCase,
    GetEpisodeWatchHistoryUseCase,
  ],
  exports: [WatchHistoryRepository],
})
export class WatchHistoryModule {}
