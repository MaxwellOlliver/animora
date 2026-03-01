import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EpisodesRepository } from '../episodes.repository';
import { PlaylistsRepository } from '../../playlists/playlists.repository';
import type { CreateEpisodeDto } from '../dto/create-episode.dto';
import type { Episode } from '../episode.entity';

@Injectable()
export class CreateEpisodeUseCase {
  constructor(
    private readonly episodesRepository: EpisodesRepository,
    private readonly playlistsRepository: PlaylistsRepository,
  ) {}

  async execute(dto: CreateEpisodeDto): Promise<Episode> {
    const playlist = await this.playlistsRepository.findById(dto.playlistId);
    if (!playlist) throw new NotFoundException('Playlist not found');

    const existing = await this.episodesRepository.findByPlaylistId(dto.playlistId);
    const conflict = existing.find((e) => e.number === dto.number);
    if (conflict) {
      throw new ConflictException(
        `An episode with number ${dto.number} already exists in this playlist`,
      );
    }

    return this.episodesRepository.create({
      playlistId: dto.playlistId,
      number: dto.number,
      title: dto.title,
      description: dto.description,
    });
  }
}
