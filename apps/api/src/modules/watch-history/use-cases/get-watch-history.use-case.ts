import { Injectable } from '@nestjs/common';

import type {
  CursorPaginatedRequest,
  CursorPaginatedResponse,
} from '@/common/types/pagination.types';

import type { WatchHistoryWithEpisode } from '../watch-history.repository';
import { WatchHistoryRepository } from '../watch-history.repository';

@Injectable()
export class GetWatchHistoryUseCase {
  constructor(
    private readonly watchHistoryRepository: WatchHistoryRepository,
  ) {}

  async execute(input: {
    profileId: string;
    pagination: CursorPaginatedRequest;
  }): Promise<CursorPaginatedResponse<WatchHistoryWithEpisode>> {
    return this.watchHistoryRepository.findByProfileCursor(
      input.profileId,
      input.pagination,
    );
  }
}
