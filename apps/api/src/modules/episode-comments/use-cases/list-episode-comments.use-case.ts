import { Injectable } from '@nestjs/common';

import type { CursorPaginatedRequest } from '@/common/types/pagination.types';

import {
  EpisodeCommentsRepository,
  type ReplyComment,
  type TopLevelComment,
} from '../episode-comments.repository';

@Injectable()
export class ListEpisodeCommentsUseCase {
  constructor(private readonly commentsRepository: EpisodeCommentsRepository) {}

  async execute(input: {
    episodeId: string;
    parentId?: string;
    pagination: CursorPaginatedRequest;
  }) {
    if (input.parentId) {
      return this.commentsRepository.findRepliesCursor(
        input.parentId,
        input.pagination,
      );
    }

    return this.commentsRepository.findByEpisodeCursor(
      input.episodeId,
      input.pagination,
    );
  }
}
