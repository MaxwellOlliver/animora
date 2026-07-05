import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import type { ProfileWithAvatar } from '@/common/types/profile.types';

import type { EpisodesInternalClient, ProfilesInternalClient } from './types';

export const API_INTERNAL_GRPC = 'API_INTERNAL_GRPC';

@Injectable()
export class GrpcClientService implements OnModuleInit {
  private profilesInternal!: ProfilesInternalClient;
  private episodesInternal!: EpisodesInternalClient;

  constructor(@Inject(API_INTERNAL_GRPC) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.profilesInternal =
      this.client.getService<ProfilesInternalClient>('ProfilesInternal');
    this.episodesInternal =
      this.client.getService<EpisodesInternalClient>('EpisodesInternal');
  }

  async getOwnedProfile(
    profileId: string,
    userId: string,
  ): Promise<ProfileWithAvatar | null> {
    const response = await firstValueFrom(
      this.profilesInternal.getOwnedProfile({ profileId, userId }),
    );

    if (!response.owned) return null;

    return {
      id: response.id,
      name: response.name,
      avatar: response.hasAvatar
        ? {
            picture: {
              key: response.avatarKey,
              purpose: response.avatarPurpose,
            },
          }
        : null,
    };
  }

  async episodeExists(episodeId: string): Promise<boolean> {
    const response = await firstValueFrom(
      this.episodesInternal.episodeExists({ episodeId }),
    );
    return response.exists;
  }
}
