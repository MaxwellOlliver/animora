import { Injectable, NotFoundException } from '@nestjs/common';

import type { CursorPaginatedRequest } from '@/common/types/pagination.types';
import { EpisodesRepository } from '@/modules/admin/episodes/episodes.repository';

import { EpisodeCommentsRepository } from '../repositories/episode-comments.repository';

@Injectable()
export class ListEpisodeCommentsUseCase {
  constructor(
    private readonly commentsRepository: EpisodeCommentsRepository,
    private readonly episodesRepository: EpisodesRepository,
  ) {}

  async execute(input: {
    episodeId: string;
    parentId?: string;
    viewerProfileId?: string;
    pagination: CursorPaginatedRequest;
  }) {
    const episode = await this.episodesRepository.findByIdWithContext(
      input.episodeId,
      true,
    );
    if (!episode) {
      throw new NotFoundException('Episode not found');
    }

    if (input.parentId) {
      return this.commentsRepository.findRepliesCursor(
        input.parentId,
        input.pagination,
        input.viewerProfileId,
      );
    }

    return this.commentsRepository.findByEpisodeCursor(
      input.episodeId,
      input.pagination,
      input.viewerProfileId,
    );
  }
}
