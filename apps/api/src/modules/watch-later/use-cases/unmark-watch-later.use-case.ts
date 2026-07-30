import { Injectable } from '@nestjs/common';

import { WatchLaterRepository } from '../watch-later.repository';

@Injectable()
export class UnmarkWatchLaterUseCase {
  constructor(private readonly watchLaterRepository: WatchLaterRepository) {}

  async execute(input: { profileId: string; seriesId: string }): Promise<void> {
    await this.watchLaterRepository.unmark(input.profileId, input.seriesId);
  }
}
