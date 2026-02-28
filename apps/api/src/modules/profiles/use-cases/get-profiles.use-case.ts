import { Injectable } from '@nestjs/common';
import { ProfilesRepository } from '../profiles.repository';
import type { Profile } from '../profile.entity';

@Injectable()
export class GetProfilesUseCase {
  constructor(private readonly profilesRepository: ProfilesRepository) {}

  async execute(userId: string): Promise<Profile[]> {
    return this.profilesRepository.findByUserId(userId);
  }
}
