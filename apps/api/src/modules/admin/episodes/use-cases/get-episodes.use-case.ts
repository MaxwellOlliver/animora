import { Injectable, NotFoundException } from '@nestjs/common';

import { PlaylistsRepository } from '../../playlists/playlists.repository';
import {
  EpisodesRepository,
  type EpisodeWithContext,
  type EpisodeWithMedia,
} from '../episodes.repository';

@Injectable()
export class GetEpisodesUseCase {
  constructor(
    private readonly episodesRepository: EpisodesRepository,
    private readonly playlistsRepository: PlaylistsRepository,
  ) {}

  async execute(
    playlistId?: string,
  ): Promise<EpisodeWithMedia[] | EpisodeWithContext[]> {
    if (playlistId) {
      const playlist = await this.playlistsRepository.findById(playlistId);
      if (!playlist) throw new NotFoundException('Playlist not found');

      return this.episodesRepository.findByPlaylistId(playlistId);
    }

    return this.episodesRepository.findAll();
  }
}
