import { Injectable } from '@nestjs/common';

import type { CursorPaginatedRequest } from '@/common/types/pagination.types';

import { EpisodeCommentsRepository } from '../repositories/episode-comments.repository';

@Injectable()
export class ListEpisodeCommentsUseCase {
  constructor(private readonly commentsRepository: EpisodeCommentsRepository) {}

  async execute(input: {
    episodeId: string;
    parentId?: string;
    viewerProfileId?: string;
    pagination: CursorPaginatedRequest;
  }) {
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
