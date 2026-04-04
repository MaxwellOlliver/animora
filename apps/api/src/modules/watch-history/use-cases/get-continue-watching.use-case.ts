import { Injectable } from '@nestjs/common';

import type {
  CursorPaginatedRequest,
  CursorPaginatedResponse,
} from '@/common/types/pagination.types';

import type { WatchHistoryWithEpisode } from '../watch-history.repository';
import { WatchHistoryRepository } from '../watch-history.repository';

@Injectable()
export class GetContinueWatchingUseCase {
  constructor(
    private readonly watchHistoryRepository: WatchHistoryRepository,
  ) {}

  async execute(input: {
    profileId: string;
    pagination: CursorPaginatedRequest;
  }): Promise<CursorPaginatedResponse<WatchHistoryWithEpisode>> {
    return this.watchHistoryRepository.findContinueWatching(
      input.profileId,
      input.pagination,
    );
  }
}
