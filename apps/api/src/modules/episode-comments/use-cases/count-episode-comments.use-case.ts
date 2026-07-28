import { Injectable, NotFoundException } from '@nestjs/common';

import { EpisodesRepository } from '@/modules/admin/episodes/episodes.repository';

import { EpisodeCommentsRepository } from '../repositories/episode-comments.repository';

@Injectable()
export class CountEpisodeCommentsUseCase {
  constructor(
    private readonly commentsRepository: EpisodeCommentsRepository,
    private readonly episodesRepository: EpisodesRepository,
  ) {}

  async execute(input: { episodeId: string }): Promise<{ total: number }> {
    const episode = await this.episodesRepository.findByIdWithContext(
      input.episodeId,
      true,
    );
    if (!episode) {
      throw new NotFoundException('Episode not found');
    }

    const total = await this.commentsRepository.countByEpisode(input.episodeId);
    return { total };
  }
}
