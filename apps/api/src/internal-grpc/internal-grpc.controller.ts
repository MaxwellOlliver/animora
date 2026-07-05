import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { EpisodesRepository } from '@/modules/admin/episodes/episodes.repository';
import { ProfilesRepository } from '@/modules/profiles/profiles.repository';

@Controller()
export class InternalGrpcController {
  constructor(
    private readonly profilesRepository: ProfilesRepository,
    private readonly episodesRepository: EpisodesRepository,
  ) {}

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

  @GrpcMethod('EpisodesInternal', 'EpisodeExists')
  async episodeExists({ episodeId }: { episodeId: string }) {
    const episode = await this.episodesRepository.findById(episodeId);
    return { exists: !!episode };
  }
}
