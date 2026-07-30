import { Injectable } from '@nestjs/common';

import { WatchLaterRepository } from '../watch-later.repository';

@Injectable()
export class GetWatchLaterStatusUseCase {
  constructor(private readonly watchLaterRepository: WatchLaterRepository) {}

  async execute(input: {
    profileId: string;
    seriesId: string;
  }): Promise<{ isMarked: boolean }> {
    const isMarked = await this.watchLaterRepository.isMarked(
      input.profileId,
      input.seriesId,
    );
    return { isMarked };
  }
}
