import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { EpisodesRepository } from '@/modules/admin/episodes/episodes.repository';
import { ProfilesRepository } from '@/modules/profiles/profiles.repository';

import type { WatchHistory } from '../watch-history.entity';
import { WatchHistoryRepository } from '../watch-history.repository';

@Injectable()
export class UpsertWatchProgressUseCase {
  constructor(
    private readonly watchHistoryRepository: WatchHistoryRepository,
    private readonly profilesRepository: ProfilesRepository,
    private readonly episodesRepository: EpisodesRepository,
  ) {}

  async execute(input: {
    userId: string;
    profileId: string;
    episodeId: string;
    positionSeconds: number;
    status: 'watching' | 'finished';
  }): Promise<WatchHistory> {
    const profile = await this.profilesRepository.findById(input.profileId);
    if (!profile || profile.userId !== input.userId) {
      throw new ForbiddenException('Profile does not belong to user');
    }

    const episode = await this.episodesRepository.findById(input.episodeId);
    if (!episode) {
      throw new NotFoundException('Episode not found');
    }

    return this.watchHistoryRepository.upsert({
      profileId: input.profileId,
      episodeId: input.episodeId,
      positionSeconds: input.positionSeconds,
      status: input.status,
    });
  }
}
