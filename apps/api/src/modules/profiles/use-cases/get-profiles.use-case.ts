import { Injectable } from '@nestjs/common';

import type { ProfileWithAvatar } from '../profiles.repository';
import { ProfilesRepository } from '../profiles.repository';

@Injectable()
export class GetProfilesUseCase {
  constructor(private readonly profilesRepository: ProfilesRepository) {}

  async execute(userId: string): Promise<ProfileWithAvatar[]> {
    return this.profilesRepository.findByUserId(userId);
  }
}
