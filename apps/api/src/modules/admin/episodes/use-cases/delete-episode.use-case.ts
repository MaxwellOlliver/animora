import { Injectable, NotFoundException } from '@nestjs/common';

import { DeleteMediaUseCase } from '@/modules/media/use-cases/delete-media.use-case';

import { EpisodesRepository } from '../episodes.repository';

@Injectable()
export class DeleteEpisodeUseCase {
  constructor(
    private readonly episodesRepository: EpisodesRepository,
    private readonly deleteMediaUseCase: DeleteMediaUseCase,
  ) {}

  async execute(id: string): Promise<void> {
    const episode = await this.episodesRepository.findById(id);
    if (!episode) throw new NotFoundException('Episode not found');

    await this.episodesRepository.delete(id);

    if (episode.thumbnailId) {
      await this.deleteMediaUseCase.execute(episode.thumbnailId);
    }
  }
}
