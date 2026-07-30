import { Injectable } from '@nestjs/common';

import type {
  CursorPaginatedRequest,
  CursorPaginatedResponse,
} from '@/common/types/pagination.types';

import type { WatchLaterSeries } from '../watch-later.repository';
import { WatchLaterRepository } from '../watch-later.repository';

@Injectable()
export class ListWatchLaterUseCase {
  constructor(private readonly watchLaterRepository: WatchLaterRepository) {}

  async execute(input: {
    profileId: string;
    pagination: CursorPaginatedRequest;
  }): Promise<CursorPaginatedResponse<WatchLaterSeries>> {
    return this.watchLaterRepository.findByProfileCursor(
      input.profileId,
      input.pagination,
    );
  }
}
