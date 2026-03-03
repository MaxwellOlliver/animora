import { Injectable, NotFoundException } from '@nestjs/common';

import type { Episode } from '../episode.entity';
import { EpisodesRepository } from '../episodes.repository';

@Injectable()
export class GetEpisodeUseCase {
  constructor(private readonly episodesRepository: EpisodesRepository) {}

  async execute(id: string): Promise<Episode> {
    const episode = await this.episodesRepository.findById(id);
    if (!episode) throw new NotFoundException('Episode not found');
    return episode;
  }
}
