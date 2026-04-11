import { Injectable, NotFoundException } from '@nestjs/common';

import { SeriesRepository } from '../../series/repositories/series.repository';
import {
  PlaylistsRepository,
  type PlaylistWithMedia,
  type PlaylistWithMediaAndSeries,
} from '../playlists.repository';

@Injectable()
export class GetPlaylistsUseCase {
  constructor(
    private readonly playlistsRepository: PlaylistsRepository,
    private readonly seriesRepository: SeriesRepository,
  ) {}

  async execute(
    seriesId?: string,
  ): Promise<PlaylistWithMedia[] | PlaylistWithMediaAndSeries[]> {
    if (seriesId) {
      const s = await this.seriesRepository.findById(seriesId);
      if (!s) throw new NotFoundException('Series not found');

      return this.playlistsRepository.findBySeriesId(seriesId);
    }

    return this.playlistsRepository.findAll();
  }
}
