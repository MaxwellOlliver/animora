import { ForbiddenException, Injectable } from '@nestjs/common';

import type {
  CursorPaginatedRequest,
  CursorPaginatedResponse,
} from '@/common/types/pagination.types';
import { ProfilesRepository } from '@/modules/profiles/profiles.repository';

import type { WatchHistoryWithEpisode } from '../watch-history.repository';
import { WatchHistoryRepository } from '../watch-history.repository';

@Injectable()
export class GetWatchHistoryUseCase {
  constructor(
    private readonly watchHistoryRepository: WatchHistoryRepository,
    private readonly profilesRepository: ProfilesRepository,
  ) {}

  async execute(input: {
    userId: string;
    profileId: string;
    pagination: CursorPaginatedRequest;
  }): Promise<CursorPaginatedResponse<WatchHistoryWithEpisode>> {
    const profile = await this.profilesRepository.findById(input.profileId);
    if (!profile || profile.userId !== input.userId) {
      throw new ForbiddenException('Profile does not belong to user');
    }

    return this.watchHistoryRepository.findByProfileCursor(
      input.profileId,
      input.pagination,
    );
  }
}
