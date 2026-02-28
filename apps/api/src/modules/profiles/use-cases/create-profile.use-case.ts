import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProfilesRepository } from '../profiles.repository.js';
import { AvatarsRepository } from '../../admin/avatars/avatars.repository.js';
import type { Profile } from '../profile.entity.js';

@Injectable()
export class CreateProfileUseCase {
  public MAX_PROFILES = 5;

  constructor(
    private readonly profilesRepository: ProfilesRepository,
    private readonly avatarsRepository: AvatarsRepository,
  ) {}

  async execute(input: {
    userId: string;
    name: string;
    avatarId?: string;
  }): Promise<Profile> {
    const count = await this.profilesRepository.countByUserId(input.userId);

    if (count >= this.MAX_PROFILES) {
      throw new ConflictException(
        `Maximum of ${this.MAX_PROFILES} profiles reached`,
      );
    }

    let avatarId = input.avatarId;

    if (avatarId) {
      const avatar = await this.avatarsRepository.findById(avatarId);
      if (!avatar) {
        throw new NotFoundException('Avatar not found');
      }
    } else {
      const defaultAvatar = await this.avatarsRepository.findDefault();
      if (!defaultAvatar) {
        throw new NotFoundException('No default avatar configured');
      }
      avatarId = defaultAvatar.id;
    }

    return this.profilesRepository.create({
      userId: input.userId,
      name: input.name,
      avatarId,
    });
  }
}
