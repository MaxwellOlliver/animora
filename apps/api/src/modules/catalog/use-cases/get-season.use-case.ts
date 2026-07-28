import { Injectable } from '@nestjs/common';

import type { SeasonPlaylist } from '@/modules/admin/playlists/playlists.repository';
import { PlaylistsRepository } from '@/modules/admin/playlists/playlists.repository';

import { getSeasonDateRange, type SeasonName } from '../season.util';

@Injectable()
export class GetSeasonUseCase {
  constructor(private readonly playlistsRepository: PlaylistsRepository) {}

  async execute({
    year,
    season,
  }: {
    year: number;
    season: SeasonName;
  }): Promise<SeasonPlaylist[]> {
    const { from, to } = getSeasonDateRange(year, season);
    return this.playlistsRepository.findByAirStartDateRange(from, to);
  }
}
