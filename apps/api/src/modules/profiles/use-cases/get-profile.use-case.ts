import { Injectable, NotFoundException } from '@nestjs/common';

import type { Profile } from '../profile.entity';
import { ProfilesRepository } from '../profiles.repository';

@Injectable()
export class GetProfileUseCase {
  constructor(private readonly profilesRepository: ProfilesRepository) {}

  async execute(input: {
    userId: string;
    profileId: string;
  }): Promise<Profile> {
    const profile = await this.profilesRepository.findById(input.profileId);

    if (!profile || profile.userId !== input.userId) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }
}
