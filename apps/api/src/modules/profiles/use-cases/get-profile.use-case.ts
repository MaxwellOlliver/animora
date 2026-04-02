import { Injectable, NotFoundException } from '@nestjs/common';

import type { ProfileWithAvatar } from '../profiles.repository';
import { ProfilesRepository } from '../profiles.repository';

@Injectable()
export class GetProfileUseCase {
  constructor(private readonly profilesRepository: ProfilesRepository) {}

  async execute(input: {
    userId: string;
    profileId: string;
  }): Promise<ProfileWithAvatar> {
    const profile = await this.profilesRepository.findById(input.profileId);

    if (!profile || profile.userId !== input.userId) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }
}
