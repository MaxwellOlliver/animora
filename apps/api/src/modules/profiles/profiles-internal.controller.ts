import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { ProfilesRepository } from './profiles.repository';

@Controller()
export class ProfilesInternalController {
  constructor(private readonly profilesRepository: ProfilesRepository) {}

  @GrpcMethod('ProfilesInternal', 'GetOwnedProfile')
  async getOwnedProfile({
    profileId,
    userId,
  }: {
    profileId: string;
    userId: string;
  }) {
    const profile = await this.profilesRepository.findOwnedByUser(
      profileId,
      userId,
    );

    if (!profile) {
      return {
        owned: false,
        id: '',
        name: '',
        hasAvatar: false,
        avatarKey: '',
        avatarPurpose: '',
      };
    }

    return {
      owned: true,
      id: profile.id,
      name: profile.name,
      hasAvatar: !!profile.avatar?.picture,
      avatarKey: profile.avatar?.picture?.key ?? '',
      avatarPurpose: profile.avatar?.picture?.purpose ?? '',
    };
  }
}
