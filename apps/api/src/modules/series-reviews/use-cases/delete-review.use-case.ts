import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ProfilesRepository } from '@/modules/profiles/profiles.repository';

import { SeriesReviewsRepository } from '../series-reviews.repository';

@Injectable()
export class DeleteReviewUseCase {
  constructor(
    private readonly seriesReviewsRepository: SeriesReviewsRepository,
    private readonly profilesRepository: ProfilesRepository,
  ) {}

  async execute(input: {
    userId: string;
    profileId: string;
    seriesId: string;
  }): Promise<void> {
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

    await this.seriesReviewsRepository.delete(existing.id);
  }
}
