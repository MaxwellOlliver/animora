import { Injectable } from '@nestjs/common';

import { PlaylistsRepository } from '@/modules/admin/playlists/playlists.repository';

@Injectable()
export class GetSeriesPlaylistsUseCase {
  constructor(private readonly playlistsRepository: PlaylistsRepository) {}

  async execute(seriesId: string) {
    return this.playlistsRepository.findBySeriesId(seriesId);
  }
}
