import { ConflictException, Injectable } from '@nestjs/common';

import type { SeriesReview } from '../series-review.entity';
import { SeriesReviewsRepository } from '../series-reviews.repository';

@Injectable()
export class CreateReviewUseCase {
  constructor(
    private readonly seriesReviewsRepository: SeriesReviewsRepository,
  ) {}

  async execute(input: {
    profileId: string;
    seriesId: string;
    rating: number;
    text: string;
  }): Promise<SeriesReview> {
    const existing = await this.seriesReviewsRepository.findBySeriesAndProfile(
      input.seriesId,
      input.profileId,
    );
    if (existing) {
      throw new ConflictException('You already reviewed this series');
    }

    return this.seriesReviewsRepository.create({
      seriesId: input.seriesId,
      profileId: input.profileId,
      rating: input.rating,
      text: input.text,
    });
  }
}
