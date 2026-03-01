import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PlaylistsRepository } from '../playlists.repository';
import type { UpdatePlaylistDto } from '../dto/update-playlist.dto';
import type { Playlist } from '../playlist.entity';

@Injectable()
export class UpdatePlaylistUseCase {
  constructor(private readonly playlistsRepository: PlaylistsRepository) {}

  async execute(id: string, dto: UpdatePlaylistDto): Promise<Playlist> {
    const playlist = await this.playlistsRepository.findById(id);
    if (!playlist) throw new NotFoundException('Playlist not found');

    if (dto.number !== undefined && dto.number !== playlist.number) {
      const siblings = await this.playlistsRepository.findBySeriesId(
        playlist.seriesId,
      );
      const conflict = siblings.find(
        (p) => p.number === dto.number && p.id !== id,
      );
      if (conflict) {
        throw new ConflictException(
          `A playlist with number ${dto.number} already exists in this series`,
        );
      }
    }

    return this.playlistsRepository.update(id, dto);
  }
}
