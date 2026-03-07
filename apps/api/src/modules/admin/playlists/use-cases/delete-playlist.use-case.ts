import { Injectable, NotFoundException } from '@nestjs/common';

import { DeleteMediaUseCase } from '@/modules/media/use-cases/delete-media.use-case';

import { PlaylistsRepository } from '../playlists.repository';

@Injectable()
export class DeletePlaylistUseCase {
  constructor(
    private readonly playlistsRepository: PlaylistsRepository,
    private readonly deleteMediaUseCase: DeleteMediaUseCase,
  ) {}

  async execute(id: string): Promise<void> {
    const playlist = await this.playlistsRepository.findById(id);
    if (!playlist) throw new NotFoundException('Playlist not found');

    await this.playlistsRepository.delete(id);

    if (playlist.coverId) {
      await this.deleteMediaUseCase.execute(playlist.coverId);
    }
  }
}
