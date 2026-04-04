import { Injectable, NotFoundException } from '@nestjs/common';

import { SeriesReviewsRepository } from '../series-reviews.repository';

@Injectable()
export class DeleteReviewUseCase {
  constructor(
    private readonly seriesReviewsRepository: SeriesReviewsRepository,
  ) {}

  async execute(input: { profileId: string; seriesId: string }): Promise<void> {
    const existing = await this.seriesReviewsRepository.findBySeriesAndProfile(
      input.seriesId,
      input.profileId,
    );
    if (!existing) {
      throw new NotFoundException('Review not found');
    }

    await this.seriesReviewsRepository.delete(existing.id);
  }
}
