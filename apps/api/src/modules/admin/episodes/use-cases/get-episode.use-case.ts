import { Injectable, NotFoundException } from '@nestjs/common';
import { EpisodesRepository } from '../episodes.repository';
import type { Episode } from '../episode.entity';

@Injectable()
export class GetEpisodeUseCase {
  constructor(private readonly episodesRepository: EpisodesRepository) {}

  async execute(id: string): Promise<Episode> {
    const episode = await this.episodesRepository.findById(id);
    if (!episode) throw new NotFoundException('Episode not found');
    return episode;
  }
}
