import { Injectable } from '@nestjs/common';

import { EpisodeCommentsRepository } from '../repositories/episode-comments.repository';

@Injectable()
export class CountEpisodeCommentsUseCase {
  constructor(
    private readonly commentsRepository: EpisodeCommentsRepository,
  ) {}

  async execute(input: { episodeId: string }): Promise<{ total: number }> {
    const total = await this.commentsRepository.countByEpisode(
      input.episodeId,
    );
    return { total };
  }
}
