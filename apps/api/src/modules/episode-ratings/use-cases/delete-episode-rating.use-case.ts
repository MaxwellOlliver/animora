import { Injectable, NotFoundException } from '@nestjs/common';

import { EpisodesRepository } from '@/modules/admin/episodes/episodes.repository';

import { EpisodeRatingsRepository } from '../episode-ratings.repository';

@Injectable()
export class DeleteEpisodeRatingUseCase {
  constructor(
    private readonly episodeRatingsRepository: EpisodeRatingsRepository,
    private readonly episodesRepository: EpisodesRepository,
  ) {}

  async execute(input: {
    profileId: string;
    episodeId: string;
  }): Promise<void> {
    const episode = await this.episodesRepository.findById(input.episodeId);
    if (!episode) {
      throw new NotFoundException('Episode not found');
    }

    await this.episodeRatingsRepository.delete(
      input.profileId,
      input.episodeId,
    );
  }
}
