import { Injectable } from '@nestjs/common';

import type { WatchHistory } from '../watch-history.entity';
import { WatchHistoryRepository } from '../watch-history.repository';

@Injectable()
export class GetEpisodeWatchHistoryUseCase {
  constructor(
    private readonly watchHistoryRepository: WatchHistoryRepository,
  ) {}

  async execute(input: {
    profileId: string;
    episodeId: string;
  }): Promise<WatchHistory | null> {
    return (
      (await this.watchHistoryRepository.findByProfileAndEpisode(
        input.profileId,
        input.episodeId,
      )) ?? null
    );
  }
}
