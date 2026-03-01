import { Injectable, NotFoundException } from '@nestjs/common';
import { PlaylistsRepository } from '../playlists.repository';
import { SeriesRepository } from '../../series/series.repository';
import type { Playlist } from '../playlist.entity';

@Injectable()
export class GetPlaylistsUseCase {
  constructor(
    private readonly playlistsRepository: PlaylistsRepository,
    private readonly seriesRepository: SeriesRepository,
  ) {}

  async execute(seriesId: string): Promise<Playlist[]> {
    const s = await this.seriesRepository.findById(seriesId);
    if (!s) throw new NotFoundException('Series not found');

    return this.playlistsRepository.findBySeriesId(seriesId);
  }
}
