import { Injectable, NotFoundException } from '@nestjs/common';
import { ProfilesRepository } from '../profiles.repository.js';
import { AvatarsRepository } from '../../admin/avatars/avatars.repository.js';
import type { Profile } from '../profile.entity.js';
import type { UpdateProfileDto } from '../dto/update-profile.dto.js';

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    private readonly profilesRepository: ProfilesRepository,
    private readonly avatarsRepository: AvatarsRepository,
  ) {}

  async execute(input: {
    userId: string;
    profileId: string;
    data: UpdateProfileDto;
  }): Promise<Profile> {
    const profile = await this.profilesRepository.findById(input.profileId);

    if (!profile || profile.userId !== input.userId) {
      throw new NotFoundException('Profile not found');
    }

    if (input.data.avatarId) {
      const avatar = await this.avatarsRepository.findById(input.data.avatarId);
      if (!avatar) {
        throw new NotFoundException('Avatar not found');
      }
    }

    return this.profilesRepository.update(input.profileId, input.data);
  }
}
