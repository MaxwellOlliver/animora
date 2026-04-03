import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { ProfilesRepository } from '@/modules/profiles/profiles.repository';

import type { SeriesReview } from '../series-review.entity';
import { SeriesReviewsRepository } from '../series-reviews.repository';

@Injectable()
export class CreateReviewUseCase {
  constructor(
    private readonly seriesReviewsRepository: SeriesReviewsRepository,
    private readonly profilesRepository: ProfilesRepository,
  ) {}

  async execute(input: {
    userId: string;
    profileId: string;
    seriesId: string;
    rating: number;
    text: string;
  }): Promise<SeriesReview> {
    const profile = await this.profilesRepository.findById(input.profileId);
    if (!profile || profile.userId !== input.userId) {
      throw new ForbiddenException('Profile does not belong to user');
    }

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
