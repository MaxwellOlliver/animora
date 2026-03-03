import { Injectable } from '@nestjs/common';

import type { Profile } from '../profile.entity';
import { ProfilesRepository } from '../profiles.repository';

@Injectable()
export class GetProfilesUseCase {
  constructor(private readonly profilesRepository: ProfilesRepository) {}

  async execute(userId: string): Promise<Profile[]> {
    return this.profilesRepository.findByUserId(userId);
  }
}
