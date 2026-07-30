import { Injectable, NotFoundException } from '@nestjs/common';

import { SeriesRepository } from '@/modules/admin/series/repositories/series.repository';

import { WatchLaterRepository } from '../watch-later.repository';

@Injectable()
export class MarkWatchLaterUseCase {
  constructor(
    private readonly watchLaterRepository: WatchLaterRepository,
    private readonly seriesRepository: SeriesRepository,
  ) {}

  async execute(input: { profileId: string; seriesId: string }): Promise<void> {
    const series = await this.seriesRepository.findById(input.seriesId, true);
    if (!series) {
      throw new NotFoundException('Series not found');
    }

    await this.watchLaterRepository.mark(input.profileId, input.seriesId);
  }
}
