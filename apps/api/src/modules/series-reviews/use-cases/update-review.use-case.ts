import { Injectable, NotFoundException } from '@nestjs/common';

import type { SeriesReview } from '../series-review.entity';
import { SeriesReviewsRepository } from '../series-reviews.repository';

@Injectable()
export class UpdateReviewUseCase {
  constructor(
    private readonly seriesReviewsRepository: SeriesReviewsRepository,
  ) {}

  async execute(input: {
    profileId: string;
    seriesId: string;
    rating?: number;
    text?: string;
  }): Promise<SeriesReview> {
    const existing = await this.seriesReviewsRepository.findBySeriesAndProfile(
      input.seriesId,
      input.profileId,
    );
    if (!existing) {
      throw new NotFoundException('Review not found');
    }

    return this.seriesReviewsRepository.update(existing.id, {
      rating: input.rating,
      text: input.text,
    });
  }
}
