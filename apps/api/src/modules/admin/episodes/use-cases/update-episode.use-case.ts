import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EpisodesRepository } from '../episodes.repository';
import type { UpdateEpisodeDto } from '../dto/update-episode.dto';
import type { Episode } from '../episode.entity';

@Injectable()
export class UpdateEpisodeUseCase {
  constructor(private readonly episodesRepository: EpisodesRepository) {}

  async execute(id: string, dto: UpdateEpisodeDto): Promise<Episode> {
    const episode = await this.episodesRepository.findById(id);
    if (!episode) throw new NotFoundException('Episode not found');

    if (dto.number !== undefined && dto.number !== episode.number) {
      const siblings = await this.episodesRepository.findByPlaylistId(
        episode.playlistId,
      );
      const conflict = siblings.find(
        (e) => e.number === dto.number && e.id !== id,
      );
      if (conflict) {
        throw new ConflictException(
          `An episode with number ${dto.number} already exists in this playlist`,
        );
      }
    }

    return this.episodesRepository.update(id, dto);
  }
}
