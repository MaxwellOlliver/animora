import { ForbiddenException, Injectable } from '@nestjs/common';

import { ProfilesRepository } from '@/modules/profiles/profiles.repository';

import type { SeriesReviewWithProfile } from '../series-reviews.repository';
import { SeriesReviewsRepository } from '../series-reviews.repository';

@Injectable()
export class GetMyReviewUseCase {
  constructor(
    private readonly seriesReviewsRepository: SeriesReviewsRepository,
    private readonly profilesRepository: ProfilesRepository,
  ) {}

  async execute(input: {
    userId: string;
    profileId: string;
    seriesId: string;
  }): Promise<SeriesReviewWithProfile | null> {
    const profile = await this.profilesRepository.findById(input.profileId);
    if (!profile || profile.userId !== input.userId) {
      throw new ForbiddenException('Profile does not belong to user');
    }

    const review = await this.seriesReviewsRepository.findBySeriesAndProfile(
      input.seriesId,
      input.profileId,
    );
    return review ?? null;
  }
}
