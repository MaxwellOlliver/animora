import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ProfilesRepository } from '@/modules/profiles/profiles.repository';

import type { SeriesReview } from '../series-review.entity';
import { SeriesReviewsRepository } from '../series-reviews.repository';

@Injectable()
export class UpdateReviewUseCase {
  constructor(
    private readonly seriesReviewsRepository: SeriesReviewsRepository,
    private readonly profilesRepository: ProfilesRepository,
  ) {}

  async execute(input: {
    userId: string;
    profileId: string;
    seriesId: string;
    rating?: number;
    text?: string;
  }): Promise<SeriesReview> {
    const profile = await this.profilesRepository.findById(input.profileId);
    if (!profile || profile.userId !== input.userId) {
      throw new ForbiddenException('Profile does not belong to user');
    }

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
