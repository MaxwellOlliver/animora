import { Injectable, NotFoundException } from '@nestjs/common';

import { EpisodesRepository } from '@/modules/admin/episodes/episodes.repository';

import type { EpisodeRating } from '../episode-rating.entity';
import { EpisodeRatingsRepository } from '../episode-ratings.repository';

@Injectable()
export class UpsertEpisodeRatingUseCase {
  constructor(
    private readonly episodeRatingsRepository: EpisodeRatingsRepository,
    private readonly episodesRepository: EpisodesRepository,
  ) {}

  async execute(input: {
    profileId: string;
    episodeId: string;
    value: 'like' | 'dislike';
  }): Promise<EpisodeRating> {
    const episode = await this.episodesRepository.findById(input.episodeId);
    if (!episode) {
      throw new NotFoundException('Episode not found');
    }

    return this.episodeRatingsRepository.upsert({
      profileId: input.profileId,
      episodeId: input.episodeId,
      value: input.value,
    });
  }
}
