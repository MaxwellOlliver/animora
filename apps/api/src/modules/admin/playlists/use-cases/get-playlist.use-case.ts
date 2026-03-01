import { Injectable, NotFoundException } from '@nestjs/common';
import { PlaylistsRepository } from '../playlists.repository';
import type { Playlist } from '../playlist.entity';

@Injectable()
export class GetPlaylistUseCase {
  constructor(private readonly playlistsRepository: PlaylistsRepository) {}

  async execute(id: string): Promise<Playlist> {
    const playlist = await this.playlistsRepository.findById(id);
    if (!playlist) throw new NotFoundException('Playlist not found');
    return playlist;
  }
}
