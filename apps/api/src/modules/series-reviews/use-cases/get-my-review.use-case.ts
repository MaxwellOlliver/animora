import { Injectable } from '@nestjs/common';

import type { SeriesReviewWithProfile } from '../series-reviews.repository';
import { SeriesReviewsRepository } from '../series-reviews.repository';

@Injectable()
export class GetMyReviewUseCase {
  constructor(
    private readonly seriesReviewsRepository: SeriesReviewsRepository,
  ) {}

  async execute(input: {
    profileId: string;
    seriesId: string;
  }): Promise<SeriesReviewWithProfile | null> {
    const review = await this.seriesReviewsRepository.findBySeriesAndProfile(
      input.seriesId,
      input.profileId,
    );
    return review ?? null;
  }
}
