import { Module } from '@nestjs/common';

import { EpisodesModule } from '../admin/episodes/episodes.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { EpisodeRatingsController } from './episode-ratings.controller';
import { EpisodeRatingsRepository } from './episode-ratings.repository';
import { DeleteEpisodeRatingUseCase } from './use-cases/delete-episode-rating.use-case';
import { UpsertEpisodeRatingUseCase } from './use-cases/upsert-episode-rating.use-case';

@Module({
  imports: [ProfilesModule, EpisodesModule],
  controllers: [EpisodeRatingsController],
  providers: [
    EpisodeRatingsRepository,
    UpsertEpisodeRatingUseCase,
    DeleteEpisodeRatingUseCase,
  ],
  exports: [EpisodeRatingsRepository],
})
export class EpisodeRatingsModule {}
