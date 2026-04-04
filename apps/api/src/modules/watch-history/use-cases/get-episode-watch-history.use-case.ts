import { ForbiddenException, Injectable } from '@nestjs/common';

import { ProfilesRepository } from '@/modules/profiles/profiles.repository';

import type { WatchHistory } from '../watch-history.entity';
import { WatchHistoryRepository } from '../watch-history.repository';

@Injectable()
export class GetEpisodeWatchHistoryUseCase {
  constructor(
    private readonly watchHistoryRepository: WatchHistoryRepository,
    private readonly profilesRepository: ProfilesRepository,
  ) {}

  async execute(input: {
    userId: string;
    profileId: string;
    episodeId: string;
  }): Promise<WatchHistory | null> {
    const profile = await this.profilesRepository.findById(input.profileId);
    if (!profile || profile.userId !== input.userId) {
      throw new ForbiddenException('Profile does not belong to user');
    }

    return (
      (await this.watchHistoryRepository.findByProfileAndEpisode(
        input.profileId,
        input.episodeId,
      )) ?? null
    );
  }
}
