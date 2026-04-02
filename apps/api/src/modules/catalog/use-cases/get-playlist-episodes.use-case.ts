import { Injectable } from '@nestjs/common';

import { EpisodesRepository } from '@/modules/admin/episodes/episodes.repository';

@Injectable()
export class GetPlaylistEpisodesUseCase {
  constructor(private readonly episodesRepository: EpisodesRepository) {}

  async execute(playlistId: string) {
    return this.episodesRepository.findByPlaylistId(playlistId);
  }
}
